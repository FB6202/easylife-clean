package com.easylife.app.users;

import com.easylife.app.users.api.UserResponse;
import com.easylife.app.users.payload.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserSearchService userSearchService;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody @Valid RegisterUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.register(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @GetMapping("/keycloak/{keycloakId}")
    public ResponseEntity<UserResponse> findByKeycloakId(@PathVariable String keycloakId) {
        return ResponseEntity.ok(userService.findByKeycloakId(keycloakId));
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<ProfileResponse> updateProfile(
            @PathVariable Long id,
            @RequestBody @Valid ProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(id, request));
    }

    @PutMapping("/{id}/address")
    public ResponseEntity<AddressResponse> updateAddress(
            @PathVariable Long id,
            @RequestBody @Valid AddressRequest request) {
        return ResponseEntity.ok(userService.updateAddress(id, request));
    }

    @PutMapping("/{id}/settings")
    public ResponseEntity<SettingsResponse> updateSettings(
            @PathVariable Long id,
            @RequestBody @Valid SettingsRequest request) {
        return ResponseEntity.ok(userService.updateSettings(id, request));
    }

    @PutMapping("/{id}/profile-image")
    public ResponseEntity<Void> updateProfileImage(
            @PathVariable Long id,
            @RequestBody String imagePath) {
        userService.updateProfileImage(id, imagePath);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/profile-image/presigned-url")
    public ResponseEntity<String> generateProfileImageUploadUrl(
            @PathVariable Long id,
            @RequestParam String fileName,
            @RequestParam String contentType) {
        return ResponseEntity.ok(userService.generateProfileImageUploadUrl(id, fileName, contentType));
    }

    @PatchMapping("/{id}/profile-image/confirm")
    public ResponseEntity<Void> confirmProfileImageUpload(
            @PathVariable Long id,
            @RequestBody String imagePath) {
        userService.updateProfileImage(id, imagePath);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserSearchResponse>> search(
            @RequestParam String query,
            @RequestParam Long requesterId) {
        return ResponseEntity.ok(userSearchService.search(query, requesterId));
    }

}
