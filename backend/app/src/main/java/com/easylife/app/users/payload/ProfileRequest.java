package com.easylife.app.users.payload;

import jakarta.validation.constraints.NotBlank;

public record ProfileRequest(
        @NotBlank String firstname,
        @NotBlank String lastname,
        String bio,
        String profileImagePath,
        String mobileNumber
) {}