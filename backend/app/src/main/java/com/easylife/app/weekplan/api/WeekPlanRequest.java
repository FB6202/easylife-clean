package com.easylife.app.weekplan.api;

import com.easylife.app.shared.enums.WeekPlanStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record WeekPlanRequest(
        @NotBlank String title,
        String intention,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        WeekPlanStatus status,
        String reflection,
        List<Long> categoryIds,
        List<WeekPlanItemRequest> items
) {}
