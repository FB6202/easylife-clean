package com.easylife.app.weekplan;

import com.easylife.app.weekplan.api.WeekPlanFilter;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

class WeekPlanSpecification {

    static Specification<WeekPlan> build(Long userId, WeekPlanFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("userId"), userId));

            if (filter != null) {
                if (filter.status() != null) {
                    predicates.add(cb.equal(root.get("status"), filter.status()));
                }
                if (filter.startDateFrom() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(
                            root.get("startDate"), filter.startDateFrom()
                    ));
                }
                if (filter.startDateTo() != null) {
                    predicates.add(cb.lessThanOrEqualTo(
                            root.get("startDate"), filter.startDateTo()
                    ));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}