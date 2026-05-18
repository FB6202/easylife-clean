package com.easylife.app.users.payload;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterUserRequest(
        @NotBlank String keycloakId,
        @NotBlank String username,
        @NotBlank @Email String email,
        @NotBlank String firstname,
        @NotBlank String lastname,
        String mobileNumber
) {}