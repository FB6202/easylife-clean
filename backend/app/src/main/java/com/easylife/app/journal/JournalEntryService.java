package com.easylife.app.journal;

import com.easylife.app.journal.api.JournalEntryRequest;
import com.easylife.app.journal.api.JournalEntryResponse;
import com.easylife.app.journal.api.JournalFilter;
import com.easylife.app.shared.payload.PageResponse;

import java.time.LocalDate;

public interface JournalEntryService {

    JournalEntryResponse create(JournalEntryRequest request, Long userId);

    JournalEntryResponse findById(Long id, Long userId);

    JournalEntryResponse findByDate(LocalDate date, Long userId);

    PageResponse<JournalEntryResponse> findAll(Long userId, JournalFilter filter, int page, int size);

    JournalEntryResponse update(Long id, JournalEntryRequest request, Long userId);

    void delete(Long id, Long userId);

}
