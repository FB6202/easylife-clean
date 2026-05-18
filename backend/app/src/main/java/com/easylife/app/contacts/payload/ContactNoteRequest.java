package com.easylife.app.contacts.payload;

import jakarta.validation.constraints.NotBlank;

public record ContactNoteRequest(
        @NotBlank String content
) {}
