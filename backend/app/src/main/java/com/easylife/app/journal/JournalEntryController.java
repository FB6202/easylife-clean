package com.easylife.app.journal;

import com.easylife.app.journal.api.JournalEntryRequest;
import com.easylife.app.journal.api.JournalEntryResponse;
import com.easylife.app.journal.api.JournalFilter;
import com.easylife.app.shared.payload.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/journal")
@RequiredArgsConstructor
public class JournalEntryController {

    private final JournalEntryService journalEntryService;

    @PostMapping
    public ResponseEntity<JournalEntryResponse> create(
            @RequestBody @Valid JournalEntryRequest request,
            @RequestParam Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(journalEntryService.create(request, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JournalEntryResponse> findById(
            @PathVariable Long id,
            @RequestParam Long userId) {
        return ResponseEntity.ok(journalEntryService.findById(id, userId));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<JournalEntryResponse> findByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam Long userId) {
        return ResponseEntity.ok(journalEntryService.findByDate(date, userId));
    }

    @GetMapping
    public ResponseEntity<PageResponse<JournalEntryResponse>> findAll(
            @RequestParam Long userId,
            @ModelAttribute JournalFilter filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(journalEntryService.findAll(userId, filter, page, size));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JournalEntryResponse> update(
            @PathVariable Long id,
            @RequestBody @Valid JournalEntryRequest request,
            @RequestParam Long userId) {
        return ResponseEntity.ok(journalEntryService.update(id, request, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestParam Long userId) {
        journalEntryService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }

}
