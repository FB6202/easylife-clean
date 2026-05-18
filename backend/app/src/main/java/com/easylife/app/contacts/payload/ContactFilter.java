package com.easylife.app.contacts.payload;

import com.easylife.app.shared.enums.RelationshipType;

import java.util.List;

public record ContactFilter(
        RelationshipType relationshipType,
        String company,
        List<Long> categoryIds
) {}
