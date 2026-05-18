package com.easylife.app.categories.payload;

import com.easylife.app.shared.enums.AccessType;

import java.time.LocalDateTime;

public record CategoryResponse(
        Long id,
        String name,
        String description,
        String color,
        String icon,
        AccessType accessType,
        LocalDateTime createdAt
) {}
