package com.easylife.app.categories;

import com.easylife.app.categories.payload.CategoryFilter;
import org.springframework.data.jpa.domain.Specification;

class CategorySpecification {

    static Specification<Category> build(Long userId, CategoryFilter filter) {
        Specification<Category> spec = (root, query, cb) ->
                cb.equal(root.get("userId"), userId);

        if (filter == null) return spec;

        if (filter.name() != null && !filter.name().isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("name")),
                            "%" + filter.name().toLowerCase() + "%"));
        }

        if (filter.accessType() != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("accessType"), filter.accessType()));
        }

        return spec;
    }
}
