package com.easylife.app.goals;

import com.easylife.app.goals.payload.GoalRequest;
import com.easylife.app.goals.payload.GoalResponse;
import com.easylife.app.goals.payload.GoalTaskRequest;
import com.easylife.app.goals.payload.GoalTaskResponse;
import com.easylife.app.shared.enums.AccessType;
import com.easylife.app.shared.enums.GoalStatus;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;

@Component
class GoalMapper {

    public GoalResponse toResponse(Goal goal, String presignedImageUrl) {
        return new GoalResponse(
                goal.getId(),
                goal.getTitle(),
                goal.getDescription(),
                goal.getMeasurableTarget(),
                goal.getTargetValue(),
                goal.getTargetUnit(),
                goal.getCurrentProgress(),
                goal.getDeadline(),
                goal.getStatus(),
                goal.getAccessType(),
                goal.getCreatedAt(),
                goal.getCategoryIds(),
                goal.getTasks() != null
                        ? goal.getTasks().stream().map(this::toTaskResponse).toList()
                        : new ArrayList<>(),
                presignedImageUrl
        );
    }

    public GoalResponse toResponse(Goal goal) {
        return toResponse(goal, null);
    }

    public GoalTaskResponse toTaskResponse(GoalTask task) {
        return new GoalTaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getDone(),
                task.getProgressContribution(),
                task.getDueDate(),
                task.getCreatedAt()
        );
    }

    public Goal toEntity(GoalRequest request, Long userId) {
        return Goal.builder()
                .title(request.title())
                .description(request.description())
                .measurableTarget(request.measurableTarget())
                .targetValue(request.targetValue())
                .targetUnit(request.targetUnit())
                .currentProgress(request.currentProgress() != null ? request.currentProgress() : 0)
                .deadline(request.deadline())
                .status(request.status() != null ? request.status() : GoalStatus.ACTIVE)
                .accessType(request.accessType() != null ? request.accessType() : AccessType.PRIVATE)
                .createdAt(LocalDateTime.now())
                .userId(userId)
                .categoryIds(request.categoryIds() != null ? request.categoryIds() : new ArrayList<>())
                .tasks(new ArrayList<>())
                .build();
    }

    public GoalTask toTaskEntity(GoalTaskRequest request, Goal goal) {
        return GoalTask.builder()
                .title(request.title())
                .description(request.description())
                .done(request.done() != null ? request.done() : false)
                .progressContribution(request.progressContribution())
                .dueDate(request.dueDate())
                .createdAt(LocalDateTime.now())
                .goal(goal)
                .build();
    }

    public void update(Goal goal, GoalRequest request) {
        goal.setTitle(request.title());
        goal.setDescription(request.description());
        goal.setMeasurableTarget(request.measurableTarget());
        goal.setTargetValue(request.targetValue());
        goal.setTargetUnit(request.targetUnit());
        goal.setCurrentProgress(request.currentProgress());
        goal.setDeadline(request.deadline());
        goal.setStatus(request.status());
        goal.setAccessType(request.accessType());
        goal.setCategoryIds(request.categoryIds() != null ? request.categoryIds() : new ArrayList<>());
    }

    public void updateTask(GoalTask task, GoalTaskRequest request) {
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setDone(request.done());
        task.setProgressContribution(request.progressContribution());
        task.setDueDate(request.dueDate());
    }

}
