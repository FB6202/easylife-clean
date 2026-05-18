package com.easylife.app.goals.payload;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record GoalTaskRequest(
        @NotBlank String title,
        String description,
        Boolean done,
        Integer progressContribution,
        LocalDate dueDate
) {}
