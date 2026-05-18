package com.easylife.app.users;

import com.easylife.app.shared.enums.ColorTheme;
import com.easylife.app.shared.enums.Language;
import com.easylife.app.users.api.UserResponse;
import com.easylife.app.users.payload.*;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
class UserMapper {

    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getKeycloakId(),
                user.getUsername(),
                user.getEmail(),
                user.getLocked(),
                user.getEmailVerified(),
                user.getCreatedAt(),
                toProfileResponse(user.getProfile()),
                toSettingsResponse(user.getSettings())
        );
    }

    public ProfileResponse toProfileResponse(Profile profile) {
        if (profile == null) return null;
        return new ProfileResponse(
                profile.getId(),
                profile.getFirstname(),
                profile.getLastname(),
                profile.getProfileImagePath(),
                profile.getBio(),
                profile.getMobileNumber(),
                toAddressResponse(profile.getAddress())
        );
    }

    public AddressResponse toAddressResponse(Address address) {
        if (address == null) return null;
        return new AddressResponse(
                address.getId(),
                address.getCountry(),
                address.getStreet(),
                address.getNumber(),
                address.getAdditionalAddressInfo(),
                address.getZipCode(),
                address.getCity()
        );
    }

    public SettingsResponse toSettingsResponse(Settings settings) {
        if (settings == null) return null;
        return new SettingsResponse(
                settings.getId(),
                settings.getLanguage(),
                settings.getWebColorTheme(),
                settings.getMobileColorTheme(),
                settings.getEmailNotifications(),
                settings.getPushNotifications()
        );
    }

    public User toEntity(RegisterUserRequest request) {
        return User.builder()
                .keycloakId(request.keycloakId())
                .username(request.username())
                .email(request.email())
                .locked(false)
                .emailVerified(false)
                .createdAt(LocalDateTime.now())
                .profile(Profile.builder()
                        .firstname(request.firstname())
                        .lastname(request.lastname())
                        .mobileNumber(request.mobileNumber())
                        .build())
                .settings(Settings.builder()
                        .language(Language.DE)
                        .webColorTheme(ColorTheme.LIGHT)
                        .mobileColorTheme(ColorTheme.LIGHT)
                        .emailNotifications(true)
                        .pushNotifications(true)
                        .build())
                .build();
    }

    public void updateProfile(Profile profile, ProfileRequest request) {
        profile.setFirstname(request.firstname());
        profile.setLastname(request.lastname());
        profile.setBio(request.bio());
        profile.setProfileImagePath(request.profileImagePath());
        profile.setMobileNumber(request.mobileNumber());
    }

    public void updateAddress(Address address, AddressRequest request) {
        address.setCountry(request.country());
        address.setStreet(request.street());
        address.setNumber(request.number());
        address.setAdditionalAddressInfo(request.additionalAddressInfo());
        address.setZipCode(request.zipCode());
        address.setCity(request.city());
    }

    public void updateSettings(Settings settings, SettingsRequest request) {
        settings.setLanguage(request.language());
        settings.setWebColorTheme(request.webColorTheme());
        settings.setMobileColorTheme(request.mobileColorTheme());
        settings.setEmailNotifications(request.emailNotifications());
        settings.setPushNotifications(request.pushNotifications());
    }

}
