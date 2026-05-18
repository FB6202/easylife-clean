package com.easylife.app.users;

import com.easylife.app.users.payload.FollowRequest;
import com.easylife.app.users.payload.FollowResponse;

import java.util.List;

public interface FollowService {

    FollowResponse sendFollowRequest(FollowRequest request, Long followerId);

    FollowResponse acceptFollowRequest(Long followId, Long userId);

    FollowResponse declineFollowRequest(Long followId, Long userId);

    void unfollow(Long followingId, Long followerId);

    List<FollowResponse> getFollowers(Long userId);

    List<FollowResponse> getFollowing(Long userId);

    List<FollowResponse> getPendingRequests(Long userId);

    boolean isFollowing(Long followerId, Long followingId);

}
