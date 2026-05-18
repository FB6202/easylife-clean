package com.easylife.app.users.payload;

import jakarta.validation.constraints.NotNull;

public record FollowRequest(
        @NotNull Long followingId
) {}
