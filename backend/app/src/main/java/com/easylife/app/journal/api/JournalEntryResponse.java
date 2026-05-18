package com.easylife.app.journal.api;

import com.easylife.app.shared.enums.MoodLevel;
import com.easylife.app.weekplan.api.WeekPlanSummary;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record JournalEntryResponse(
        Long id,
        String title,
        MoodLevel mood,
        String wentWell,
        String wentBad,
        String learnings,
        String gratitude,
        LocalDate entryDate,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<Long> categoryIds,
        Long weekPlanId,
        WeekPlanSummary weekPlan
) {}
