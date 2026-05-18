package com.easylife.app.goals;

import com.easylife.app.goals.payload.GoalFilter;
import com.easylife.app.shared.enums.AccessType;
import com.easylife.app.shared.enums.GoalStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.List;

class GoalSpecification {

    static Specification<Goal> build(Long userId, GoalFilter filter) {
        return Specification
                .where(byUserId(userId))
                .and(byStatus(filter.status()))
                .and(byAccessType(filter.accessType()))
                .and(byDeadlineBetween(filter.deadlineFrom(), filter.deadlineTo()))
                .and(byCategoryIds(filter.categoryIds()));
    }

    private static Specification<Goal> byUserId(Long userId) {
        return (root, query, cb) -> cb.equal(root.get("userId"), userId);
    }

    private static Specification<Goal> byStatus(GoalStatus status) {
        return (root, query, cb) -> status == null ? null
                : cb.equal(root.get("status"), status);
    }

    private static Specification<Goal> byAccessType(AccessType accessType) {
        return (root, query, cb) -> accessType == null ? null
                : cb.equal(root.get("accessType"), accessType);
    }

    private static Specification<Goal> byDeadlineBetween(LocalDate from, LocalDate to) {
        return (root, query, cb) -> {
            if (from == null && to == null) return null;
            if (from == null) return cb.lessThanOrEqualTo(root.get("deadline"), to);
            if (to == null) return cb.greaterThanOrEqualTo(root.get("deadline"), from);
            return cb.between(root.get("deadline"), from, to);
        };
    }

    private static Specification<Goal> byCategoryIds(List<Long> categoryIds) {
        return (root, query, cb) ->
                categoryIds == null || categoryIds.isEmpty() ? null
                        : root.join("categoryIds").in(categoryIds);
    }

}
