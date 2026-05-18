package com.easylife.app.contacts;

import com.easylife.app.contacts.payload.ContactFilter;
import com.easylife.app.shared.enums.RelationshipType;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

class ContactSpecification {

    static Specification<Contact> build(Long userId, ContactFilter filter) {
        return Specification
                .where(byUserId(userId))
                .and(byRelationshipType(filter.relationshipType()))
                .and(byCompany(filter.company()))
                .and(byCategoryIds(filter.categoryIds()));
    }

    private static Specification<Contact> byUserId(Long userId) {
        return (root, query, cb) -> cb.equal(root.get("userId"), userId);
    }

    private static Specification<Contact> byRelationshipType(RelationshipType relationshipType) {
        return (root, query, cb) -> relationshipType == null ? null
                : cb.equal(root.get("relationshipType"), relationshipType);
    }

    private static Specification<Contact> byCompany(String company) {
        return (root, query, cb) -> company == null ? null
                : cb.like(cb.lower(root.get("company")), "%" + company.toLowerCase() + "%");
    }

    private static Specification<Contact> byCategoryIds(List<Long> categoryIds) {
        return (root, query, cb) ->
                categoryIds == null || categoryIds.isEmpty() ? null
                        : root.join("categoryIds").in(categoryIds);
    }

}
