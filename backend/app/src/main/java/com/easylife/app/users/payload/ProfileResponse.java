package com.easylife.app.users.payload;

public record ProfileResponse(
        Long id,
        String firstname,
        String lastname,
        String profileImagePath,
        String bio,
        String mobileNumber,
        AddressResponse address
) {}