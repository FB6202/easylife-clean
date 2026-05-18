package com.easylife.app.journal.api;

import com.easylife.app.shared.enums.MoodLevel;

import java.time.LocalDate;
import java.util.List;

public record JournalFilter(
        MoodLevel mood,
        LocalDate entryDateFrom,
        LocalDate entryDateTo,
        List<Long> categoryIds
) {}
