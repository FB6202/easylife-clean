package com.easylife.app.goals;

import com.easylife.app.categories.api.CategoryApi;
import com.easylife.app.goals.api.GoalApi;
import com.easylife.app.goals.payload.GoalFilter;
import com.easylife.app.goals.payload.GoalRequest;
import com.easylife.app.goals.payload.GoalResponse;
import com.easylife.app.goals.payload.GoalTaskRequest;
import com.easylife.app.goals.payload.GoalTaskResponse;
import com.easylife.app.shared.enums.AccessType;
import com.easylife.app.shared.enums.GoalStatus;
import com.easylife.app.shared.payload.PageResponse;
import com.easylife.app.storage.api.StorageApi;
import com.easylife.app.users.api.UserApi;
import com.easylife.app.users.api.UserResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
class GoalServiceImpl implements GoalService, GoalApi {

    private final GoalRepository goalRepository;
    private final GoalTaskRepository goalTaskRepository;
    private final GoalMapper goalMapper;
    private final CategoryApi categoryApi;
    private final StorageApi storageApi;
    private final UserApi userApi;

    @Override
    public GoalResponse create(GoalRequest request, Long userId) {
        validateCategories(request.categoryIds(), userId);
        Goal goal = goalMapper.toEntity(request, userId);
        goal.setCreatedAt(LocalDateTime.now());
        Goal saved = goalRepository.save(goal);
        return goalMapper.toResponse(
                saved,
                categoryApi.findPreviewsByIds(saved.getCategoryIds()),
                null
        );
    }

    @Override
    public GoalResponse findById(Long id, Long userId) {
        Goal goal = goalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Goal not found"));
        return goalMapper.toResponse(
                goal,
                categoryApi.findPreviewsByIds(goal.getCategoryIds()),
                storageApi.generateDownloadUrl(goal.getImagePath())
        );
    }

    @Override
    public PageResponse<GoalResponse> findAll(Long userId, GoalFilter filter, int page, int size) {
        Specification<Goal> spec = GoalSpecification.build(userId, filter);
        Page<Goal> result = goalRepository.findAll(spec, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));

        List<GoalResponse> content = result.getContent().stream()
                .map(goal -> goalMapper.toResponse(
                        goal,
                        categoryApi.findPreviewsByIds(goal.getCategoryIds()),
                        storageApi.generateDownloadUrl(goal.getImagePath())))
                .toList();

        return new PageResponse<>(
                content,
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    @Override
    public GoalResponse update(Long id, GoalRequest request, Long userId) {
        validateCategories(request.categoryIds(), userId);
        Goal goal = goalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Goal not found"));
        goalMapper.update(goal, request);
        goal.setUpdatedAt(LocalDateTime.now());
        Goal saved = goalRepository.save(goal);
        return goalMapper.toResponse(
                saved,
                categoryApi.findPreviewsByIds(saved.getCategoryIds()),
                storageApi.generateDownloadUrl(saved.getImagePath())
        );
    }

    @Override
    public GoalResponse updateImage(Long id, String imagePath, Long userId) {
        Goal goal = goalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Goal not found"));
        if (goal.getImagePath() != null) {
            storageApi.delete(goal.getImagePath());
        }
        goal.setImagePath(imagePath);
        goal.setUpdatedAt(LocalDateTime.now());
        Goal saved = goalRepository.save(goal);
        return goalMapper.toResponse(
                saved,
                categoryApi.findPreviewsByIds(saved.getCategoryIds()),
                storageApi.generateDownloadUrl(imagePath)
        );
    }

    @Override
    public GoalResponse updateProgress(Long id, Integer progress, Long userId) {
        Goal goal = goalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Goal not found"));
        goal.setCurrentProgress(progress);
        goal.setUpdatedAt(LocalDateTime.now());
        return goalMapper.toResponse(goalRepository.save(goal));
    }

    @Override
    public void delete(Long id, Long userId) {
        Goal goal = goalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Goal not found"));
        goalRepository.delete(goal);
    }

    @Override
    public GoalTaskResponse addTask(Long goalId, GoalTaskRequest request, Long userId) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Goal not found"));
        GoalTask task = goalMapper.toTaskEntity(request, goal);
        task.setCreatedAt(LocalDateTime.now());
        GoalTask saved = goalTaskRepository.save(task);

        recalculateProgress(goal);

        return goalMapper.toTaskResponse(saved);
    }

    @Override
    public GoalTaskResponse updateTask(Long goalId, Long taskId, GoalTaskRequest request, Long userId) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Goal not found"));
        GoalTask task = goalTaskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
        goalMapper.updateTask(task, request);
        task.setUpdatedAt(LocalDateTime.now());
        GoalTask saved = goalTaskRepository.save(task);

        recalculateProgress(goal);

        return goalMapper.toTaskResponse(saved);
    }

    @Override
    public void deleteTask(Long goalId, Long taskId, Long userId) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Goal not found"));
        GoalTask task = goalTaskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
        goalTaskRepository.delete(task);

        recalculateProgress(goal);
    }

    private void recalculateProgress(Goal goal) {
        List<GoalTask> tasks = goalTaskRepository.findAllByGoalId(goal.getId());

        int progress = tasks.stream()
                .filter(GoalTask::getDone)
                .mapToInt(GoalTask::getProgressContribution)
                .sum();
        progress = Math.min(progress, 100);

        boolean allTasksDone = !tasks.isEmpty() && tasks.stream().allMatch(GoalTask::getDone);

        goal.setCurrentProgress(progress);

        if (goal.getStatus() != GoalStatus.ABANDONED) {
            if ((progress >= 100 || allTasksDone) && goal.getStatus() != GoalStatus.COMPLETED) {
                goal.setStatus(GoalStatus.COMPLETED);
            } else if (progress < 100 && !allTasksDone && goal.getStatus() == GoalStatus.COMPLETED) {
                goal.setStatus(GoalStatus.ACTIVE);
            }
        }

        goal.setUpdatedAt(LocalDateTime.now());
        goalRepository.save(goal);
    }

    @Override
    public String generateImageUploadUrl(Long goalId, Long userId, String fileName, String contentType) {
        goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Goal not found"));
        UserResponse user = userApi.findById(userId);
        String key = storageApi.buildKey(user.username(), "goals", fileName);
        return storageApi.generateUploadUrl(key, contentType);
    }

    @Override
    public long countPublicByUserId(Long userId) {
        return goalRepository.countByUserIdAndAccessType(userId, AccessType.PUBLIC);
    }

    @Override
    public List<GoalResponse> findDashboard(Long userId) {
        GoalFilter filter = new GoalFilter(GoalStatus.ACTIVE, null, null, null, null);
        Specification<Goal> spec = GoalSpecification.build(userId, filter);

        List<Goal> goals = goalRepository.findAll(spec);
        return goals.stream()
                .sorted(Comparator.comparing(Goal::getDeadline,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .limit(3)
                .map(goal -> goalMapper.toResponse(
                        goal,
                        categoryApi.findPreviewsByIds(goal.getCategoryIds()),
                        storageApi.generateDownloadUrl(goal.getImagePath())))
                .toList();
    }

    private void validateCategories(List<Long> categoryIds, Long userId) {
        if (categoryIds != null && !categoryIds.isEmpty()) {
            if (categoryIds.size() > 5) {
                throw new IllegalArgumentException("Maximum 5 categories allowed");
            }
            categoryIds.forEach(categoryId -> {
                if (!categoryApi.existsByIdAndUserId(categoryId, userId)) {
                    throw new EntityNotFoundException("Category not found: " + categoryId);
                }
            });
        }
    }

}