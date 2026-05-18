package com.easylife.app.weekplan.api;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record WeekPlanItemRequest(
        @NotBlank String title,
        String description,
        Boolean done,
        LocalDate dueDate
) {}
