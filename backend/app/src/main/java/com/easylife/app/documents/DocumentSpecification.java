package com.easylife.app.documents;

import com.easylife.app.documents.payload.DocumentFilter;
import com.easylife.app.shared.enums.AccessType;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.List;

class DocumentSpecification {

    static Specification<Document> build(Long userId, DocumentFilter filter) {
        return Specification
                .where(byUserId(userId))
                .and(byFileType(filter.fileType()))
                .and(byAccessType(filter.accessType()))
                .and(byUploadedBetween(filter.uploadedFrom(), filter.uploadedTo()))
                .and(byCategoryIds(filter.categoryIds()));
    }

    private static Specification<Document> byUserId(Long userId) {
        return (root, query, cb) -> cb.equal(root.get("userId"), userId);
    }

    private static Specification<Document> byFileType(String fileType) {
        return (root, query, cb) -> fileType == null ? null
                : cb.equal(root.get("fileType"), fileType);
    }

    private static Specification<Document> byAccessType(AccessType accessType) {
        return (root, query, cb) -> accessType == null ? null
                : cb.equal(root.get("accessType"), accessType);
    }

    private static Specification<Document> byUploadedBetween(LocalDateTime from, LocalDateTime to) {
        return (root, query, cb) -> {
            if (from == null && to == null) return null;
            if (from == null) return cb.lessThanOrEqualTo(root.get("uploadedAt"), to);
            if (to == null) return cb.greaterThanOrEqualTo(root.get("uploadedAt"), from);
            return cb.between(root.get("uploadedAt"), from, to);
        };
    }

    private static Specification<Document> byCategoryIds(List<Long> categoryIds) {
        return (root, query, cb) ->
                categoryIds == null || categoryIds.isEmpty() ? null
                        : root.join("categoryIds").in(categoryIds);
    }

}
