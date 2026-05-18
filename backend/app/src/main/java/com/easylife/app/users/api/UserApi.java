package com.easylife.app.users.api;

public interface UserApi {

    UserResponse findById(Long userId);

    UserResponse findByKeycloakId(String keycloakId);

    boolean existsById(Long userId);

}
