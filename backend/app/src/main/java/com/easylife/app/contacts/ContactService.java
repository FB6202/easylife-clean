package com.easylife.app.contacts;

import com.easylife.app.contacts.payload.*;
import com.easylife.app.shared.payload.PageResponse;

public interface ContactService {

    ContactResponse create(ContactRequest request, Long userId);

    ContactResponse findById(Long id, Long userId);

    PageResponse<ContactResponse> findAll(Long userId, ContactFilter filter, int page, int size);

    ContactResponse update(Long id, ContactRequest request, Long userId);

    void delete(Long id, Long userId);

    ContactNoteResponse addNote(Long contactId, ContactNoteRequest request, Long userId);

    ContactNoteResponse updateNote(Long contactId, Long noteId, ContactNoteRequest request, Long userId);

    void deleteNote(Long contactId, Long noteId, Long userId);

}

