package com.easylife.app.users.payload;

import com.easylife.app.shared.enums.ColorTheme;
import com.easylife.app.shared.enums.Language;

public record SettingsResponse(
        Long id,
        Language language,
        ColorTheme webColorTheme,
        ColorTheme mobileColorTheme,
        Boolean emailNotifications,
        Boolean pushNotifications,
        Boolean widgetTasksEnabled,
        Boolean widgetCalendarEnabled,
        Boolean widgetGoalsEnabled,
        Boolean widgetWeekplanEnabled,
        Boolean widgetCategoriesEnabled,
        Boolean widgetNotificationsEnabled,
        Boolean widgetJournalEnabled,
        Boolean widgetNetworkEnabled,
        Boolean widgetFollowingEnabled
) {}
