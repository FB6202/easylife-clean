package com.easylife.app.notifications.payload;

import com.easylife.app.shared.enums.NotificationChannel;
import com.easylife.app.shared.enums.NotificationType;
import com.easylife.app.shared.enums.ReferenceType;

public record NotificationFilter(
        NotificationType type,
        NotificationChannel channel,
        Boolean alreadyRead,
        ReferenceType referenceType
) {}
