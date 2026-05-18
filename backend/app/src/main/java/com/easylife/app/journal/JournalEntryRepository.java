package com.easylife.app.journal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDate;
import java.util.Optional;

interface JournalEntryRepository extends JpaRepository<JournalEntry, Long>, JpaSpecificationExecutor<JournalEntry> {

    Optional<JournalEntry> findByIdAndUserId(Long id, Long userId);

    Optional<JournalEntry> findByEntryDateAndUserId(LocalDate entryDate, Long userId);

    boolean existsByEntryDateAndUserId(LocalDate entryDate, Long userId);

}
