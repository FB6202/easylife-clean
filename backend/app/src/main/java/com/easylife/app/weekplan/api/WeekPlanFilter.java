package com.easylife.app.weekplan.api;

import com.easylife.app.shared.enums.WeekPlanStatus;

import java.time.LocalDate;
import java.util.List;

public record WeekPlanFilter(
        WeekPlanStatus status,
        LocalDate startDateFrom,
        LocalDate startDateTo,
        List<Long> categoryIds
) {}
