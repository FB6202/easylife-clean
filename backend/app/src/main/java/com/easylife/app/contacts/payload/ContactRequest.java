package com.easylife.app.contacts.payload;

import com.easylife.app.shared.enums.RelationshipType;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.util.List;

public record ContactRequest(
        @NotBlank String firstname,
        @NotBlank String lastname,
        String company,
        String position,
        String email,
        String phone,
        String linkedinUrl,
        String websiteUrl,
        String notes,
        String tags,
        LocalDate lastContactedAt,
        RelationshipType relationshipType,
        List<Long> categoryIds
) {}
