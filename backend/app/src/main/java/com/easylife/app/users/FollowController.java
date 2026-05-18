package com.easylife.app.users;

import com.easylife.app.users.payload.FollowRequest;
import com.easylife.app.users.payload.FollowResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/follows")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    @PostMapping
    public ResponseEntity<FollowResponse> sendFollowRequest(
            @RequestBody @Valid FollowRequest request,
            @RequestParam Long followerId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(followService.sendFollowRequest(request, followerId));
    }

    @PatchMapping("/{followId}/accept")
    public ResponseEntity<FollowResponse> acceptFollowRequest(
            @PathVariable Long followId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(followService.acceptFollowRequest(followId, userId));
    }

    @PatchMapping("/{followId}/decline")
    public ResponseEntity<FollowResponse> declineFollowRequest(
            @PathVariable Long followId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(followService.declineFollowRequest(followId, userId));
    }

    @DeleteMapping("/{followingId}")
    public ResponseEntity<Void> unfollow(
            @PathVariable Long followingId,
            @RequestParam Long followerId) {
        followService.unfollow(followingId, followerId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/followers")
    public ResponseEntity<List<FollowResponse>> getFollowers(
            @RequestParam Long userId) {
        return ResponseEntity.ok(followService.getFollowers(userId));
    }

    @GetMapping("/following")
    public ResponseEntity<List<FollowResponse>> getFollowing(
            @RequestParam Long userId) {
        return ResponseEntity.ok(followService.getFollowing(userId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<FollowResponse>> getPendingRequests(
            @RequestParam Long userId) {
        return ResponseEntity.ok(followService.getPendingRequests(userId));
    }

    @GetMapping("/is-following")
    public ResponseEntity<Boolean> isFollowing(
            @RequestParam Long followerId,
            @RequestParam Long followingId) {
        return ResponseEntity.ok(followService.isFollowing(followerId, followingId));
    }

}
