package com.easylife.app.users.payload;

import com.easylife.app.shared.enums.FollowStatus;

import java.time.LocalDateTime;

public record FollowResponse(
        Long id,
        Long followerId,
        String followerUsername,
        Long followingId,
        String followingUsername,
        FollowStatus status,
        LocalDateTime createdAt
) {}
