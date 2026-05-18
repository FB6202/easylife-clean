package com.easylife.app.journal;

import com.easylife.app.journal.api.JournalFilter;
import com.easylife.app.shared.enums.MoodLevel;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.List;

class JournalEntrySpecification {

    static Specification<JournalEntry> build(Long userId, JournalFilter filter) {
        return Specification
                .where(byUserId(userId))
                .and(byMood(filter.mood()))
                .and(byEntryDateBetween(filter.entryDateFrom(), filter.entryDateTo()))
                .and(byCategoryIds(filter.categoryIds()));
    }

    private static Specification<JournalEntry> byUserId(Long userId) {
        return (root, query, cb) -> cb.equal(root.get("userId"), userId);
    }

    private static Specification<JournalEntry> byMood(MoodLevel mood) {
        return (root, query, cb) -> mood == null ? null
                : cb.equal(root.get("mood"), mood);
    }

    private static Specification<JournalEntry> byEntryDateBetween(LocalDate from, LocalDate to) {
        return (root, query, cb) -> {
            if (from == null && to == null) return null;
            if (from == null) return cb.lessThanOrEqualTo(root.get("entryDate"), to);
            if (to == null) return cb.greaterThanOrEqualTo(root.get("entryDate"), from);
            return cb.between(root.get("entryDate"), from, to);
        };
    }

    private static Specification<JournalEntry> byCategoryIds(List<Long> categoryIds) {
        return (root, query, cb) ->
                categoryIds == null || categoryIds.isEmpty() ? null
                        : root.join("categoryIds").in(categoryIds);
    }

}
