package com.easylife.app.goals.payload;

import com.easylife.app.shared.enums.AccessType;
import com.easylife.app.shared.enums.GoalStatus;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.util.List;

public record GoalRequest(
        @NotBlank String title,
        String description,
        String measurableTarget,
        Integer targetValue,
        String targetUnit,
        Integer currentProgress,
        LocalDate deadline,
        GoalStatus status,
        AccessType accessType,
        List<Long> categoryIds
) {}
