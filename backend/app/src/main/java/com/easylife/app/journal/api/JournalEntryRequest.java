package com.easylife.app.journal.api;

import com.easylife.app.shared.enums.MoodLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record JournalEntryRequest(
        @NotBlank String title,
        @NotNull MoodLevel mood,
        String wentWell,
        String wentBad,
        String learnings,
        String gratitude,
        @NotNull LocalDate entryDate,
        List<Long> categoryIds,
        Long weekPlanId
) {}
