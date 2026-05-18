package com.easylife.app.calendar;

import com.easylife.app.shared.enums.AccessType;
import com.easylife.app.shared.enums.EventType;
import com.easylife.app.shared.enums.RecurrenceType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "calendar_events")
class CalendarEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String title;
    private String description;
    private String location;
    private String eventColor;
    @Column(nullable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private LocalDateTime startDateTime;
    @Column(nullable = false)
    private LocalDateTime endDateTime;
    private Boolean allDay;

    @Enumerated(EnumType.STRING)
    private EventType eventType;
    @Enumerated(EnumType.STRING)
    private RecurrenceType recurrence;
    @Enumerated(EnumType.STRING)
    private AccessType accessType;

    @Column(nullable = false)
    private Long userId;
    @ElementCollection
    @CollectionTable(name = "event_categories",
            joinColumns = @JoinColumn(name = "event_id"))
    @Column(name = "category_id")
    private List<Long> categoryIds;

}
