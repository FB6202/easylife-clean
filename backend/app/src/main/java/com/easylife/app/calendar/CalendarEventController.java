package com.easylife.app.calendar;

import com.easylife.app.calendar.payload.CalendarEventRequest;
import com.easylife.app.calendar.payload.CalendarEventResponse;
import com.easylife.app.shared.enums.EventType;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/calendar")
@RequiredArgsConstructor
public class CalendarEventController {

    private final CalendarEventService calendarEventService;

    @PostMapping
    public ResponseEntity<CalendarEventResponse> create(
            @RequestBody @Valid CalendarEventRequest request,
            @RequestParam Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(calendarEventService.create(request, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CalendarEventResponse> findById(
            @PathVariable Long id,
            @RequestParam Long userId) {
        return ResponseEntity.ok(calendarEventService.findById(id, userId));
    }

    @GetMapping
    public ResponseEntity<List<CalendarEventResponse>> findAll(
            @RequestParam Long userId) {
        return ResponseEntity.ok(calendarEventService.findAll(userId));
    }

    @GetMapping("/range")
    public ResponseEntity<List<CalendarEventResponse>> findAllBetween(
            @RequestParam Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(calendarEventService.findAllBetween(userId, from, to));
    }

    @GetMapping("/type")
    public ResponseEntity<List<CalendarEventResponse>> findAllByEventType(
            @RequestParam Long userId,
            @RequestParam EventType eventType) {
        return ResponseEntity.ok(calendarEventService.findAllByEventType(userId, eventType));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CalendarEventResponse> update(
            @PathVariable Long id,
            @RequestBody @Valid CalendarEventRequest request,
            @RequestParam Long userId) {
        return ResponseEntity.ok(calendarEventService.update(id, request, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestParam Long userId) {
        calendarEventService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }

}
