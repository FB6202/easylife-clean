// com/easylife/app/follow/payload/FollowStatsResponse.java
package com.easylife.app.users.payload;

public record FollowStatsResponse(
        long following,
        long followers,
        long pendingRequests
) {}