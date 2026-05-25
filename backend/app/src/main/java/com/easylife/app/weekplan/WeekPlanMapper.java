package com.easylife.app.weekplan;

import com.easylife.app.categories.payload.CategoryPreview;
import com.easylife.app.weekplan.api.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
class WeekPlanMapper {

    WeekPlanResponse toResponse(WeekPlan weekPlan, List<CategoryPreview> categories) {
        List<WeekPlanItemResponse> itemResponses = weekPlan.getItems()
                .stream()
                .map(this::toItemResponse)
                .toList();

        int itemsDone  = (int) weekPlan.getItems().stream().filter(WeekPlanItem::getDone).count();
        int itemsTotal = weekPlan.getItems().size();

        return new WeekPlanResponse(
                weekPlan.getId(),
                weekPlan.getTitle(),
                weekPlan.getIntention(),
                weekPlan.getStartDate(),
                weekPlan.getEndDate(),
                weekPlan.getStatus(),
                weekPlan.getReflection(),
                weekPlan.getCreatedAt(),
                weekPlan.getUpdatedAt(),
                categories,
                itemResponses,
                itemsDone,
                itemsTotal
        );
    }

    WeekPlanItemResponse toItemResponse(WeekPlanItem item) {
        return new WeekPlanItemResponse(
                item.getId(),
                item.getTitle(),
                item.getDescription(),
                item.getDone(),
                item.getDueDate(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }

    WeekPlan toEntity(WeekPlanRequest request, Long userId) {
        WeekPlan weekPlan = new WeekPlan();
        weekPlan.setUserId(userId);
        applyRequest(weekPlan, request);
        return weekPlan;
    }

    void applyRequest(WeekPlan weekPlan, WeekPlanRequest request) {
        weekPlan.setTitle(request.title());
        weekPlan.setIntention(request.intention());
        weekPlan.setStartDate(request.startDate());
        weekPlan.setEndDate(request.endDate());
        if (request.status() != null) weekPlan.setStatus(request.status());
        weekPlan.setReflection(request.reflection());
        weekPlan.setCategoryIds(request.categoryIds() != null ? request.categoryIds() : List.of());
    }

    WeekPlanItem toItemEntity(WeekPlanItemRequest request, WeekPlan weekPlan) {
        WeekPlanItem item = new WeekPlanItem();
        item.setWeekPlan(weekPlan);
        applyItemRequest(item, request);
        return item;
    }

    void applyItemRequest(WeekPlanItem item, WeekPlanItemRequest request) {
        item.setTitle(request.title());
        item.setDescription(request.description());
        item.setDone(request.done() != null ? request.done() : false);
        item.setDueDate(request.dueDate());
    }
}
