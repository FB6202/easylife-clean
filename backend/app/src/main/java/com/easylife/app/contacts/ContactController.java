package com.easylife.app.contacts;

import com.easylife.app.contacts.payload.*;
import com.easylife.app.shared.payload.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    public ResponseEntity<ContactResponse> create(
            @RequestBody @Valid ContactRequest request,
            @RequestParam Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(contactService.create(request, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactResponse> findById(
            @PathVariable Long id,
            @RequestParam Long userId) {
        return ResponseEntity.ok(contactService.findById(id, userId));
    }

    @GetMapping
    public ResponseEntity<PageResponse<ContactResponse>> findAll(
            @RequestParam Long userId,
            @ModelAttribute ContactFilter filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(contactService.findAll(userId, filter, page, size));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContactResponse> update(
            @PathVariable Long id,
            @RequestBody @Valid ContactRequest request,
            @RequestParam Long userId) {
        return ResponseEntity.ok(contactService.update(id, request, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestParam Long userId) {
        contactService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{contactId}/notes")
    public ResponseEntity<ContactNoteResponse> addNote(
            @PathVariable Long contactId,
            @RequestBody @Valid ContactNoteRequest request,
            @RequestParam Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(contactService.addNote(contactId, request, userId));
    }

    @PutMapping("/{contactId}/notes/{noteId}")
    public ResponseEntity<ContactNoteResponse> updateNote(
            @PathVariable Long contactId,
            @PathVariable Long noteId,
            @RequestBody @Valid ContactNoteRequest request,
            @RequestParam Long userId) {
        return ResponseEntity.ok(contactService.updateNote(contactId, noteId, request, userId));
    }

    @DeleteMapping("/{contactId}/notes/{noteId}")
    public ResponseEntity<Void> deleteNote(
            @PathVariable Long contactId,
            @PathVariable Long noteId,
            @RequestParam Long userId) {
        contactService.deleteNote(contactId, noteId, userId);
        return ResponseEntity.noContent().build();
    }

}
