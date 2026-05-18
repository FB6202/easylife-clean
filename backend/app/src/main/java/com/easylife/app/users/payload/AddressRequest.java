package com.easylife.app.users.payload;

public record AddressRequest(
        String country,
        String street,
        String number,
        String additionalAddressInfo,
        String zipCode,
        String city
) {}
