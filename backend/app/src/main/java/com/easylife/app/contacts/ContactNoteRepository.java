package com.easylife.app.contacts;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

interface ContactNoteRepository extends JpaRepository<ContactNote, Long> {

    List<ContactNote> findAllByContactId(Long contactId);

    List<ContactNote> findAllByContactIdOrderByCreatedAtDesc(Long contactId);

}
