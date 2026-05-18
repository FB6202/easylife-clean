package com.easylife.app.calendar.payload;

import com.easylife.app.shared.enums.AccessType;
import com.easylife.app.shared.enums.EventType;
import com.easylife.app.shared.enums.RecurrenceType;

import java.time.LocalDateTime;
import java.util.List;

public record CalendarEventResponse(
        Long id,
        String title,
        String description,
        String location,
        String eventColor,
        LocalDateTime startDateTime,
        LocalDateTime endDateTime,
        Boolean allDay,
        EventType eventType,
        RecurrenceType recurrence,
        AccessType accessType,
        LocalDateTime createdAt,
        List<Long> categoryIds
) {}
