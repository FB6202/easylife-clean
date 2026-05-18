package com.easylife.app.calendar.payload;

import com.easylife.app.shared.enums.AccessType;
import com.easylife.app.shared.enums.EventType;
import com.easylife.app.shared.enums.RecurrenceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

public record CalendarEventRequest(
        @NotBlank String title,
        String description,
        String location,
        String eventColor,
        @NotNull LocalDateTime startDateTime,
        @NotNull LocalDateTime endDateTime,
        Boolean allDay,
        EventType eventType,
        RecurrenceType recurrence,
        AccessType accessType,
        List<Long> categoryIds
) {}
