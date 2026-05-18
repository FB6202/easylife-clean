package com.easylife.app.categories.payload;

import com.easylife.app.shared.enums.AccessType;
import jakarta.validation.constraints.NotBlank;

public record CategoryRequest(
        @NotBlank String name,
        @NotBlank String description,
        @NotBlank String color,
        @NotBlank String icon,
        AccessType accessType
) {}
