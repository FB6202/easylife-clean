package com.easylife.app.weekplan;

import com.easylife.app.weekplan.api.WeekPlanFilter;
import com.easylife.app.shared.enums.WeekPlanStatus;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.List;

class WeekPlanSpecification {

    static Specification<WeekPlan> build(Long userId, WeekPlanFilter filter) {
        return Specification
                .where(byUserId(userId))
                .and(byStatus(filter.status()))
                .and(byStartDateFrom(filter.startDateFrom()))
                .and(byStartDateTo(filter.startDateTo()))
                .and(byCategoryIds(filter.categoryIds()));
    }

    private static Specification<WeekPlan> byUserId(Long userId) {
        return (root, query, cb) -> cb.equal(root.get("userId"), userId);
    }

    private static Specification<WeekPlan> byStatus(WeekPlanStatus status) {
        return (root, query, cb) -> status == null ? null
                : cb.equal(root.get("status"), status);
    }

    private static Specification<WeekPlan> byStartDateFrom(LocalDate from) {
        return (root, query, cb) -> from == null ? null
                : cb.greaterThanOrEqualTo(root.get("startDate"), from);
    }

    private static Specification<WeekPlan> byStartDateTo(LocalDate to) {
        return (root, query, cb) -> to == null ? null
                : cb.lessThanOrEqualTo(root.get("startDate"), to);
    }

    private static Specification<WeekPlan> byCategoryIds(List<Long> categoryIds) {
        return (root, query, cb) -> {
            if (categoryIds == null || categoryIds.isEmpty()) return null;
            query.distinct(true);
            return root.join("categoryIds", JoinType.INNER).in(categoryIds);
        };
    }
}
