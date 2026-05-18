package com.easylife.app.weekplan.api;

public record WeekPlanSummary(
        Long id,
        String title,
        String startDate,
        String endDate
) {}
