package com.easylife.app.notifications.payload;

import com.easylife.app.shared.enums.NotificationChannel;
import com.easylife.app.shared.enums.NotificationType;
import com.easylife.app.shared.enums.ReferenceType;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        String title,
        String message,
        NotificationType type,
        NotificationChannel channel,
        ReferenceType referenceType,
        Long referenceId,
        Boolean alreadyRead,
        LocalDateTime scheduledAt,
        LocalDateTime sentAt,
        LocalDateTime createdAt
) {}
