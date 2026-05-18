package com.easylife.app.weekplan.api;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record WeekPlanItemResponse(
        Long id,
        String title,
        String description,
        Boolean done,
        LocalDate dueDate,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
