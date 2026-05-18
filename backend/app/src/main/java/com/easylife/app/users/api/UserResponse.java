package com.easylife.app.users.api;

import com.easylife.app.users.payload.ProfileResponse;
import com.easylife.app.users.payload.SettingsResponse;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String keycloakId,
        String username,
        String email,
        Boolean locked,
        Boolean emailVerified,
        LocalDateTime createdAt,
        ProfileResponse profile,
        SettingsResponse settings
) {}
