package com.easylife.app.users;

import com.easylife.app.shared.enums.FollowStatus;
import com.easylife.app.users.payload.FollowRequest;
import com.easylife.app.users.payload.FollowResponse;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
class FollowMapper {

    public FollowResponse toResponse(Follow follow, String followerUsername, String followingUsername) {
        return new FollowResponse(
                follow.getId(),
                follow.getFollowerId(),
                followerUsername,
                follow.getFollowingId(),
                followingUsername,
                follow.getStatus(),
                follow.getCreatedAt()
        );
    }

    public Follow toEntity(FollowRequest request, Long followerId) {
        return Follow.builder()
                .followerId(followerId)
                .followingId(request.followingId())
                .status(FollowStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
    }

}
