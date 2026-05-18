package com.easylife.app.goals.payload;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record GoalTaskResponse(
        Long id,
        String title,
        String description,
        Boolean done,
        Integer progressContribution,
        LocalDate dueDate,
        LocalDateTime createdAt
) {}
