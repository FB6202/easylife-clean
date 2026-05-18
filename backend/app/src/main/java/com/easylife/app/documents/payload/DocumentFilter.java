package com.easylife.app.documents.payload;

import com.easylife.app.shared.enums.AccessType;

import java.time.LocalDateTime;
import java.util.List;

public record DocumentFilter(
        String fileType,
        AccessType accessType,
        LocalDateTime uploadedFrom,
        LocalDateTime uploadedTo,
        List<Long> categoryIds
) {}
