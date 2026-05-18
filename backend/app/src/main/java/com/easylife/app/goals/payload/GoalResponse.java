package com.easylife.app.goals.payload;

import com.easylife.app.shared.enums.AccessType;
import com.easylife.app.shared.enums.GoalStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record GoalResponse(
        Long id,
        String title,
        String description,
        String measurableTarget,
        Integer targetValue,
        String targetUnit,
        Integer currentProgress,
        LocalDate deadline,
        GoalStatus status,
        AccessType accessType,
        LocalDateTime createdAt,
        List<Long> categoryIds,
        List<GoalTaskResponse> tasks,
        String presignedImageUrl        // neu
) {}
