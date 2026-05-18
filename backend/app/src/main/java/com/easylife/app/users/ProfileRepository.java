package com.easylife.app.users;

import org.springframework.data.jpa.repository.JpaRepository;

interface ProfileRepository extends JpaRepository<Profile, Long> {
}
