package com.easylife.app.contacts.payload;

import com.easylife.app.shared.enums.RelationshipType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record ContactResponse(
        Long id,
        String firstname,
        String lastname,
        String company,
        String position,
        String email,
        String phone,
        String linkedinUrl,
        String websiteUrl,
        String notes,
        String tags,
        LocalDate lastContactedAt,
        LocalDateTime createdAt,
        RelationshipType relationshipType,
        List<ContactNoteResponse> contactNotes,
        List<Long> categoryIds
) {}
