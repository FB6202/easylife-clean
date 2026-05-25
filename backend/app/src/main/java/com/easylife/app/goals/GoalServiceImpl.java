package com.easylife.app.goals;

import com.easylife.app.categories.api.CategoryApi;
import com.easylife.app.goals.api.GoalApi;
import com.easylife.app.goals.payload.*;
import com.easylife.app.shared.enums.AccessType;
import com.easylife.app.shared.payload.PageResponse;
import com.easylife.app.storage.api.StorageApi;
import com.easylife.app.users.api.UserApi;
import com.easylife.app.users.api.UserResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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
        Page<Goal> result = goalRepository.findAll(spec, PageRequest.of(page, size));
        return new PageResponse<>(
                result.getContent().stream()
                        .map(goal -> goalMapper.toResponse(
                                goal,
                                categoryApi.findPreviewsByIds(goal.getCategoryIds()),
                                storageApi.generateDownloadUrl(goal.getImagePath())))
                        .toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    @Override
    public GoalResponse update(Long id, GoalRequest request, Long userId) {
        Goal goal = goalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Goal not found"));
        validateCategories(request.categoryIds(), userId);
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
        return goalMapper.toTaskResponse(goalTaskRepository.save(task));
    }

    @Override
    public GoalTaskResponse updateTask(Long goalId, Long taskId, GoalTaskRequest request, Long userId) {
        goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Goal not found"));
        GoalTask task = goalTaskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
        goalMapper.updateTask(task, request);
        task.setUpdatedAt(LocalDateTime.now());
        return goalMapper.toTaskResponse(goalTaskRepository.save(task));
    }

    @Override
    public void deleteTask(Long goalId, Long taskId, Long userId) {
        goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Goal not found"));
        GoalTask task = goalTaskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
        goalTaskRepository.delete(task);
    }

    private void validateCategories(List<Long> categoryIds, Long userId) {
        if (categoryIds != null && !categoryIds.isEmpty()) {
            categoryIds.forEach(categoryId -> {
                if (!categoryApi.existsByIdAndUserId(categoryId, userId)) {
                    throw new EntityNotFoundException("Category not found: " + categoryId);
                }
            });
        }
    }

    @Override
    public String generateImageUploadUrl(Long goalId, Long userId, String fileName, String contentType) {
        goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Goal not found"));
        UserResponse user = userApi.findById(userId);
        String key = storageApi.buildKey(
                user.username(),
                "goals",
                goalId,
                fileName
        );
        return storageApi.generateUploadUrl(key, contentType);
    }

    @Override
    public long countPublicByUserId(Long userId) {
        return goalRepository.countByUserIdAndAccessType(userId, AccessType.PUBLIC);
    }

}
