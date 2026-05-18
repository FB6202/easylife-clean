package com.easylife.app.users.payload;

public record AddressResponse(
        Long id,
        String country,
        String street,
        String number,
        String additionalAddressInfo,
        String zipCode,
        String city
) {}
