package com.easylife.app.users.payload;

public record UserSearchResponse(
        Long id,
        String username,
        String firstname,
        String lastname,
        String bio,
        String profileImagePath,
        String followStatus,
        long publicGoalsCount,
        long publicCategoriesCount,
        long mutualConnections
) {}