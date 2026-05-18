package com.easylife.app.calendar;

import com.easylife.app.calendar.payload.CalendarEventRequest;
import com.easylife.app.calendar.payload.CalendarEventResponse;
import com.easylife.app.shared.enums.AccessType;
import com.easylife.app.shared.enums.EventType;

import java.time.LocalDateTime;
import java.util.List;

public interface CalendarEventService {

    CalendarEventResponse create(CalendarEventRequest request, Long userId);

    CalendarEventResponse findById(Long id, Long userId);

    List<CalendarEventResponse> findAll(Long userId);

    List<CalendarEventResponse> findAllByEventType(Long userId, EventType eventType);

    List<CalendarEventResponse> findAllByAccessType(Long userId, AccessType accessType);

    List<CalendarEventResponse> findAllBetween(Long userId, LocalDateTime from, LocalDateTime to);

    CalendarEventResponse update(Long id, CalendarEventRequest request, Long userId);

    void delete(Long id, Long userId);

}
