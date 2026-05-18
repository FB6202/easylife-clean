package com.easylife.app.users;

import com.easylife.app.shared.enums.FollowStatus;
import com.easylife.app.users.payload.FollowRequest;
import com.easylife.app.users.payload.FollowResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
class FollowServiceImpl implements FollowService {

    private final FollowRepository followRepository;
    private final FollowMapper followMapper;
    private final UserRepository userRepository;

    @Override
    public FollowResponse sendFollowRequest(FollowRequest request, Long followerId) {
        if (followerId.equals(request.followingId())) {
            throw new IllegalArgumentException("You cannot follow yourself");
        }
        if (followRepository.existsByFollowerIdAndFollowingId(followerId, request.followingId())) {
            throw new IllegalArgumentException("Follow request already exists");
        }
        if (!userRepository.existsById(request.followingId())) {
            throw new EntityNotFoundException("User not found");
        }
        Follow follow = followMapper.toEntity(request, followerId);
        Follow saved = followRepository.save(follow);
        return toResponseWithUsernames(saved);
    }

    @Override
    public FollowResponse acceptFollowRequest(Long followId, Long userId) {
        Follow follow = followRepository.findById(followId)
                .orElseThrow(() -> new EntityNotFoundException("Follow request not found"));
        if (!follow.getFollowingId().equals(userId)) {
            throw new IllegalArgumentException("Not authorized to accept this request");
        }
        follow.setStatus(FollowStatus.ACCEPTED);
        follow.setUpdatedAt(LocalDateTime.now());
        return toResponseWithUsernames(followRepository.save(follow));
    }

    @Override
    public FollowResponse declineFollowRequest(Long followId, Long userId) {
        Follow follow = followRepository.findById(followId)
                .orElseThrow(() -> new EntityNotFoundException("Follow request not found"));
        if (!follow.getFollowingId().equals(userId)) {
            throw new IllegalArgumentException("Not authorized to decline this request");
        }
        follow.setStatus(FollowStatus.DECLINED);
        follow.setUpdatedAt(LocalDateTime.now());
        return toResponseWithUsernames(followRepository.save(follow));
    }

    @Override
    public void unfollow(Long followingId, Long followerId) {
        Follow follow = followRepository
                .findByFollowerIdAndFollowingId(followerId, followingId)
                .orElseThrow(() -> new EntityNotFoundException("Follow not found"));
        followRepository.delete(follow);
    }

    @Override
    public List<FollowResponse> getFollowers(Long userId) {
        return followRepository.findAllByFollowingIdAndStatus(userId, FollowStatus.ACCEPTED)
                .stream()
                .map(this::toResponseWithUsernames)
                .toList();
    }

    @Override
    public List<FollowResponse> getFollowing(Long userId) {
        return followRepository.findAllByFollowerIdAndStatus(userId, FollowStatus.ACCEPTED)
                .stream()
                .map(this::toResponseWithUsernames)
                .toList();
    }

    @Override
    public List<FollowResponse> getPendingRequests(Long userId) {
        return followRepository.findAllByFollowingIdAndStatus(userId, FollowStatus.PENDING)
                .stream()
                .map(this::toResponseWithUsernames)
                .toList();
    }

    @Override
    public boolean isFollowing(Long followerId, Long followingId) {
        return followRepository.findByFollowerIdAndFollowingId(followerId, followingId)
                .map(f -> f.getStatus() == FollowStatus.ACCEPTED)
                .orElse(false);
    }

    private FollowResponse toResponseWithUsernames(Follow follow) {
        String followerUsername = userRepository.findById(follow.getFollowerId())
                .map(User::getUsername)
                .orElse("Unknown");
        String followingUsername = userRepository.findById(follow.getFollowingId())
                .map(User::getUsername)
                .orElse("Unknown");
        return followMapper.toResponse(follow, followerUsername, followingUsername);
    }

}
