package com.easylife.app.documents.payload;

import com.easylife.app.shared.enums.AccessType;

import java.time.LocalDateTime;
import java.util.List;

public record DocumentResponse(
        Long id,
        String title,
        String description,
        String fileType,
        Long fileSizeBytes,
        AccessType accessType,
        LocalDateTime uploadedAt,
        List<Long> categoryIds,
        String presignedUrl
) {}
