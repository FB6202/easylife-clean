package com.easylife.app.notifications;

import com.easylife.app.notifications.payload.NotificationRequest;
import com.easylife.app.notifications.payload.NotificationResponse;
import com.easylife.app.shared.enums.NotificationChannel;
import com.easylife.app.shared.enums.NotificationType;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
class NotificationMapper {

    public NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.getChannel(),
                notification.getReferenceType(),
                notification.getReferenceId(),
                notification.getAlreadyRead(),
                notification.getScheduledAt(),
                notification.getSentAt(),
                notification.getCreatedAt()
        );
    }

    public Notification toEntity(NotificationRequest request, Long userId) {
        return Notification.builder()
                .title(request.title())
                .message(request.message())
                .type(request.type() != null ? request.type() : NotificationType.INFO)
                .channel(request.channel() != null ? request.channel() : NotificationChannel.IN_APP)
                .referenceType(request.referenceType())
                .referenceId(request.referenceId())
                .alreadyRead(false)
                .scheduledAt(request.scheduledAt())
                .createdAt(LocalDateTime.now())
                .userId(userId)
                .build();
    }

    public void markAsRead(Notification notification) {
        notification.setAlreadyRead(true);
        notification.setSentAt(LocalDateTime.now());
    }

}
