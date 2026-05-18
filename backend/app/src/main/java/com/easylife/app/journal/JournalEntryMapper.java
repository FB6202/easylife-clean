package com.easylife.app.journal;

import com.easylife.app.journal.api.JournalEntryRequest;
import com.easylife.app.journal.api.JournalEntryResponse;
import com.easylife.app.weekplan.api.WeekPlanApi;
import com.easylife.app.weekplan.api.WeekPlanSummary;
import org.springframework.stereotype.Component;

@Component
class JournalEntryMapper {

    private final WeekPlanApi weekPlanApi;

    JournalEntryMapper(WeekPlanApi weekPlanApi) {
        this.weekPlanApi = weekPlanApi;
    }

    JournalEntryResponse toResponse(JournalEntry entry) {
        WeekPlanSummary weekPlanSummary = null;
        if (entry.getWeekPlanId() != null) {
            try {
                weekPlanSummary = weekPlanApi.findById(entry.getWeekPlanId());
            } catch (Exception e) {
                // WeekPlan not found – gracefully return null
            }
        }

        return new JournalEntryResponse(
                entry.getId(),
                entry.getTitle(),
                entry.getMood(),
                entry.getWentWell(),
                entry.getWentBad(),
                entry.getLearnings(),
                entry.getGratitude(),
                entry.getEntryDate(),
                entry.getCreatedAt(),
                entry.getUpdatedAt(),
                entry.getCategoryIds(),
                entry.getWeekPlanId(),
                weekPlanSummary
        );
    }

    JournalEntry toEntity(JournalEntryRequest request, Long userId) {
        JournalEntry entry = new JournalEntry();
        entry.setUserId(userId);
        update(entry, request); // ← war applyRequest
        return entry;
    }

    void update(JournalEntry entry, JournalEntryRequest request) {
        entry.setTitle(request.title());
        entry.setMood(request.mood());
        entry.setWentWell(request.wentWell());
        entry.setWentBad(request.wentBad());
        entry.setLearnings(request.learnings());
        entry.setGratitude(request.gratitude());
        entry.setEntryDate(request.entryDate());
        entry.setCategoryIds(
                request.categoryIds() != null ? request.categoryIds() : java.util.List.of()
        );
        entry.setWeekPlanId(request.weekPlanId());
    }
}
