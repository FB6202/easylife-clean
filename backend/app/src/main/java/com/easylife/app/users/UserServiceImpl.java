package com.easylife.app.users;

import com.easylife.app.categories.api.CategoryApi;
import com.easylife.app.goals.api.GoalApi;
import com.easylife.app.shared.enums.FollowStatus;
import com.easylife.app.storage.api.StorageApi;
import com.easylife.app.users.api.UserApi;
import com.easylife.app.users.api.UserResponse;
import com.easylife.app.users.payload.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService, UserApi {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final AddressRepository addressRepository;
    private final SettingsRepository settingsRepository;
    private final FollowRepository followRepository;
    private final UserMapper userMapper;
    private final StorageApi storageApi;

    @Override
    public UserResponse register(RegisterUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already in use");
        }
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username already in use");
        }
        User user = userMapper.toEntity(request);
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    public UserResponse findByKeycloakId(String keycloakId) {
        return userRepository.findByKeycloakId(keycloakId)
                .map(userMapper::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    @Override
    public UserResponse findById(Long id) {
        return userRepository.findById(id)
                .map(userMapper::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    @Override
    public ProfileResponse updateProfile(Long userId, ProfileRequest request) {
        User user = getUserEntity(userId);
        Profile profile = user.getProfile();
        userMapper.updateProfile(profile, request);
        profile.setUpdatedAt(LocalDateTime.now());
        return userMapper.toProfileResponse(profileRepository.save(profile));
    }

    @Override
    public AddressResponse updateAddress(Long userId, AddressRequest request) {
        User user = getUserEntity(userId);
        Profile profile = user.getProfile();
        Address address = profile.getAddress();
        if (address == null) {
            address = Address.builder()
                    .createdAt(LocalDateTime.now())
                    .build();
            profile.setAddress(address);
        }
        userMapper.updateAddress(address, request);
        address.setUpdatedAt(LocalDateTime.now());
        return userMapper.toAddressResponse(addressRepository.save(address));
    }

    @Override
    public SettingsResponse updateSettings(Long userId, SettingsRequest request) {
        User user = getUserEntity(userId);
        Settings settings = user.getSettings();
        userMapper.updateSettings(settings, request);
        settings.setUpdatedAt(LocalDateTime.now());
        return userMapper.toSettingsResponse(settingsRepository.save(settings));
    }

    @Override
    public void updateProfileImage(Long userId, String imagePath) {
        User user = getUserEntity(userId);
        if (user.getProfile().getProfileImagePath() != null) {
            storageApi.delete(user.getProfile().getProfileImagePath());
        }
        user.getProfile().setProfileImagePath(imagePath);
        user.getProfile().setUpdatedAt(LocalDateTime.now());
        profileRepository.save(user.getProfile());
    }

    private User getUserEntity(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    @Override
    public boolean existsById(Long userId) {
        return userRepository.existsById(userId);
    }

    @Override
    public String generateProfileImageUploadUrl(Long userId, String fileName, String contentType) {
        User user = getUserEntity(userId);
        String key = storageApi.buildKey(
                user.getUsername(),
                "profiles",
                userId,
                fileName
        );
        return storageApi.generateUploadUrl(key, contentType);
    }

}
