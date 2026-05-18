package com.easylife.app.todos;

import com.easylife.app.shared.enums.AccessType;
import com.easylife.app.shared.enums.Priority;
import com.easylife.app.shared.enums.TodoStatus;
import com.easylife.app.todos.payload.TodoFilter;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.List;

class TodoSpecification {

    static Specification<Todo> build(Long userId, TodoFilter filter) {
        return Specification
                .where(byUserId(userId))
                .and(byStatus(filter.status()))
                .and(byPriority(filter.priority()))
                .and(byAccessType(filter.accessType()))
                .and(byDueDateBetween(filter.dueDateFrom(), filter.dueDateTo()))
                .and(byCategoryIds(filter.categoryIds()));
    }

    private static Specification<Todo> byUserId(Long userId) {
        return (root, query, cb) -> cb.equal(root.get("userId"), userId);
    }

    private static Specification<Todo> byStatus(TodoStatus status) {
        return (root, query, cb) -> status == null ? null
                : cb.equal(root.get("status"), status);
    }

    private static Specification<Todo> byPriority(Priority priority) {
        return (root, query, cb) -> priority == null ? null
                : cb.equal(root.get("priority"), priority);
    }

    private static Specification<Todo> byAccessType(AccessType accessType) {
        return (root, query, cb) -> accessType == null ? null
                : cb.equal(root.get("accessType"), accessType);
    }

    private static Specification<Todo> byDueDateBetween(LocalDate from, LocalDate to) {
        return (root, query, cb) -> {
            if (from == null && to == null) return null;
            if (from == null) return cb.lessThanOrEqualTo(root.get("dueDate"), to);
            if (to == null) return cb.greaterThanOrEqualTo(root.get("dueDate"), from);
            return cb.between(root.get("dueDate"), from, to);
        };
    }

    private static Specification<Todo> byCategoryIds(List<Long> categoryIds) {
        return (root, query, cb) ->
                categoryIds == null || categoryIds.isEmpty() ? null
                        : root.join("categoryIds").in(categoryIds);
    }

}
