package com.easylife.app.calendar;

import com.easylife.app.shared.enums.AccessType;
import com.easylife.app.shared.enums.EventType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {

    List<CalendarEvent> findAllByUserId(Long userId);

    List<CalendarEvent> findAllByUserIdAndEventType(Long userId, EventType eventType);

    List<CalendarEvent> findAllByUserIdAndAccessType(Long userId, AccessType accessType);

    List<CalendarEvent> findAllByUserIdAndStartDateTimeBetween(
            Long userId, LocalDateTime from, LocalDateTime to);

    List<CalendarEvent> findAllByUserIdAndAllDay(Long userId, Boolean allDay);

    Optional<CalendarEvent> findByIdAndUserId(Long id, Long userId);

}
