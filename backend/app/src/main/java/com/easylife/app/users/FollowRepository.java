package com.easylife.app.users;

import com.easylife.app.shared.enums.FollowStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

interface FollowRepository extends JpaRepository<Follow, Long> {

    Optional<Follow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);

    List<Follow> findAllByFollowingIdAndStatus(Long followingId, FollowStatus status);

    List<Follow> findAllByFollowerIdAndStatus(Long followerId, FollowStatus status);

    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);

    long countByFollowingIdAndStatus(Long followingId, FollowStatus status);

    long countByFollowerIdAndStatus(Long followerId, FollowStatus status);

}
