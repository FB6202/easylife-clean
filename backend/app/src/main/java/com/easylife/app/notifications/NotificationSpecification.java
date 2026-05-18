package com.easylife.app.notifications;

import com.easylife.app.notifications.payload.NotificationFilter;
import com.easylife.app.shared.enums.NotificationChannel;
import com.easylife.app.shared.enums.NotificationType;
import com.easylife.app.shared.enums.ReferenceType;
import org.springframework.data.jpa.domain.Specification;

class NotificationSpecification {

    static Specification<Notification> build(Long userId, NotificationFilter filter) {
        return Specification
                .where(byUserId(userId))
                .and(byType(filter.type()))
                .and(byChannel(filter.channel()))
                .and(byAlreadyRead(filter.alreadyRead()))
                .and(byReferenceType(filter.referenceType()));
    }

    private static Specification<Notification> byUserId(Long userId) {
        return (root, query, cb) -> cb.equal(root.get("userId"), userId);
    }

    private static Specification<Notification> byType(NotificationType type) {
        return (root, query, cb) -> type == null ? null
                : cb.equal(root.get("type"), type);
    }

    private static Specification<Notification> byChannel(NotificationChannel channel) {
        return (root, query, cb) -> channel == null ? null
                : cb.equal(root.get("channel"), channel);
    }

    private static Specification<Notification> byAlreadyRead(Boolean alreadyRead) {
        return (root, query, cb) -> alreadyRead == null ? null
                : cb.equal(root.get("alreadyRead"), alreadyRead);
    }

    private static Specification<Notification> byReferenceType(ReferenceType referenceType) {
        return (root, query, cb) -> referenceType == null ? null
                : cb.equal(root.get("referenceType"), referenceType);
    }

}
