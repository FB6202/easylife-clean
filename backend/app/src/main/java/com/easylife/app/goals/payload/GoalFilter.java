package com.easylife.app.goals.payload;

import com.easylife.app.shared.enums.AccessType;
import com.easylife.app.shared.enums.GoalStatus;

import java.time.LocalDate;
import java.util.List;

public record GoalFilter(
        GoalStatus status,
        AccessType accessType,
        LocalDate deadlineFrom,
        LocalDate deadlineTo,
        List<Long> categoryIds
) {}
