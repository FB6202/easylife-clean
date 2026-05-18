package com.easylife.app.documents.payload;

import com.easylife.app.shared.enums.AccessType;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record DocumentRequest(
        @NotBlank String title,
        String description,
        @NotBlank String fileType,
        Long fileSizeBytes,
        AccessType accessType,
        List<Long> categoryIds
) {}
