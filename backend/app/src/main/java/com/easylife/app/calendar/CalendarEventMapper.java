package com.easylife.app.calendar;

import com.easylife.app.calendar.payload.CalendarEventRequest;
import com.easylife.app.calendar.payload.CalendarEventResponse;
import com.easylife.app.shared.enums.AccessType;
import com.easylife.app.shared.enums.EventType;
import com.easylife.app.shared.enums.RecurrenceType;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;

@Component
class CalendarEventMapper {

    public CalendarEventResponse toResponse(CalendarEvent event) {
        return new CalendarEventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getLocation(),
                event.getEventColor(),
                event.getStartDateTime(),
                event.getEndDateTime(),
                event.getAllDay(),
                event.getEventType(),
                event.getRecurrence(),
                event.getAccessType(),
                event.getCreatedAt(),
                event.getCategoryIds()
        );
    }

    public CalendarEvent toEntity(CalendarEventRequest request, Long userId) {
        return CalendarEvent.builder()
                .title(request.title())
                .description(request.description())
                .location(request.location())
                .eventColor(request.eventColor())
                .startDateTime(request.startDateTime())
                .endDateTime(request.endDateTime())
                .allDay(request.allDay() != null ? request.allDay() : false)
                .eventType(request.eventType() != null ? request.eventType() : EventType.APPOINTMENT)
                .recurrence(request.recurrence() != null ? request.recurrence() : RecurrenceType.NONE)
                .accessType(request.accessType() != null ? request.accessType() : AccessType.PRIVATE)
                .createdAt(LocalDateTime.now())
                .userId(userId)
                .categoryIds(request.categoryIds() != null ? request.categoryIds() : new ArrayList<>())
                .build();
    }

    public void update(CalendarEvent event, CalendarEventRequest request) {
        event.setTitle(request.title());
        event.setDescription(request.description());
        event.setLocation(request.location());
        event.setEventColor(request.eventColor());
        event.setStartDateTime(request.startDateTime());
        event.setEndDateTime(request.endDateTime());
        event.setAllDay(request.allDay());
        event.setEventType(request.eventType());
        event.setRecurrence(request.recurrence());
        event.setAccessType(request.accessType());
        event.setCategoryIds(request.categoryIds() != null ? request.categoryIds() : new ArrayList<>());
    }

}
