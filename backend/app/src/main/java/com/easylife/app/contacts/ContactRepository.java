package com.easylife.app.contacts;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

interface ContactRepository extends JpaRepository<Contact, Long>, JpaSpecificationExecutor<Contact> {

    Optional<Contact> findByIdAndUserId(Long id, Long userId);

}
