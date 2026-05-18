package com.easylife.app.users.payload;

import com.easylife.app.shared.enums.ColorTheme;
import com.easylife.app.shared.enums.Language;

public record SettingsResponse(
        Long id,
        Language language,
        ColorTheme webColorTheme,
        ColorTheme mobileColorTheme,
        Boolean emailNotifications,
        Boolean pushNotifications
) {}
