package com.easylife.app.categories.payload;

import com.easylife.app.shared.enums.AccessType;

public record CategoryFilter(
        String name,
        AccessType accessType
) {}
