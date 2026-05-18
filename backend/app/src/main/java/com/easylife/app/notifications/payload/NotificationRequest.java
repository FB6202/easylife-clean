package com.easylife.app.notifications.payload;

import com.easylife.app.shared.enums.NotificationChannel;
import com.easylife.app.shared.enums.NotificationType;
import com.easylife.app.shared.enums.ReferenceType;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public record NotificationRequest(
        @NotBlank String title,
        String message,
        NotificationType type,
        NotificationChannel channel,
        ReferenceType referenceType,
        Long referenceId,
        LocalDateTime scheduledAt
) {}
