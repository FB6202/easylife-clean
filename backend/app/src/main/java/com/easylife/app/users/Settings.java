package com.easylife.app.users;

import com.easylife.app.shared.enums.ColorTheme;
import com.easylife.app.shared.enums.Language;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "settings")
class Settings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Enumerated(EnumType.STRING)
    private Language language;
    @Enumerated(EnumType.STRING)
    private ColorTheme webColorTheme;
    @Enumerated(EnumType.STRING)
    private ColorTheme mobileColorTheme;
    @Column(nullable = false)
    private Boolean emailNotifications;
    @Column(nullable = false)
    private Boolean pushNotifications;

    // Dashboard Widget Preferences
    @Column(nullable = false)
    private Boolean widgetTasksEnabled;
    @Column(nullable = false)
    private Boolean widgetCalendarEnabled;
    @Column(nullable = false)
    private Boolean widgetGoalsEnabled;
    @Column(nullable = false)
    private Boolean widgetWeekplanEnabled;
    @Column(nullable = false)
    private Boolean widgetCategoriesEnabled;
    @Column(nullable = false)
    private Boolean widgetNotificationsEnabled;
    @Column(nullable = false)
    private Boolean widgetJournalEnabled;
    @Column(nullable = false)
    private Boolean widgetNetworkEnabled;
    @Column(nullable = false)
    private Boolean widgetFollowingEnabled;

    @Column(nullable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
