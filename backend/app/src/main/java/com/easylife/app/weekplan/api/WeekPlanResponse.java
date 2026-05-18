package com.easylife.app.weekplan.api;

import com.easylife.app.shared.enums.WeekPlanStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record WeekPlanResponse(
        Long id,
        String title,
        String intention,
        LocalDate startDate,
        LocalDate endDate,
        WeekPlanStatus status,
        String reflection,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<Long> categoryIds,
        List<WeekPlanItemResponse> items,
        int itemsDone,
        int itemsTotal
) {}
