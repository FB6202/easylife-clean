package com.easylife.app.contacts.payload;

import java.time.LocalDateTime;

public record ContactNoteResponse(
        Long id,
        String content,
        LocalDateTime createdAt
) {}
