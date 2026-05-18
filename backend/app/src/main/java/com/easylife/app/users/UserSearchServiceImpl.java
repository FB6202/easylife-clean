package com.easylife.app.users;

import com.easylife.app.categories.api.CategoryApi;
import com.easylife.app.goals.api.GoalApi;
import com.easylife.app.shared.enums.FollowStatus;
import com.easylife.app.users.payload.UserSearchResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
class UserSearchServiceImpl implements UserSearchService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final GoalApi goalApi;
    private final CategoryApi categoryApi;

    @Override
    public List<UserSearchResponse> search(String query, Long requesterId) {
        return userRepository.searchByQuery(query, requesterId)
                .stream()
                .map(user -> toSearchResponse(user, requesterId))
                .toList();
    }

    private UserSearchResponse toSearchResponse(User user, Long requesterId) {
        Profile profile = user.getProfile();
        return new UserSearchResponse(
                user.getId(),
                user.getUsername(),
                profile != null ? profile.getFirstname() : null,
                profile != null ? profile.getLastname() : null,
                profile != null ? profile.getBio() : null,
                profile != null ? profile.getProfileImagePath() : null,
                resolveFollowStatus(requesterId, user.getId()),
                goalApi.countPublicByUserId(user.getId()),
                categoryApi.countPublicByUserId(user.getId()),
                resolveMutualConnections(requesterId, user.getId())
        );
    }

    private String resolveFollowStatus(Long requesterId, Long targetUserId) {
        return followRepository.findByFollowerIdAndFollowingId(requesterId, targetUserId)
                .map(f -> switch (f.getStatus()) {
                    case ACCEPTED -> "FOLLOWING";
                    case PENDING  -> "REQUESTED";
                    default       -> "NONE";
                })
                .orElse("NONE");
    }

    private long resolveMutualConnections(Long requesterId, Long targetUserId) {
        Set<Long> requesterFollowing = followRepository
                .findAllByFollowerIdAndStatus(requesterId, FollowStatus.ACCEPTED)
                .stream()
                .map(Follow::getFollowingId)
                .collect(Collectors.toSet());

        return followRepository
                .findAllByFollowerIdAndStatus(targetUserId, FollowStatus.ACCEPTED)
                .stream()
                .map(Follow::getFollowingId)
                .filter(requesterFollowing::contains)
                .count();
    }

}