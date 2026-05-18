package com.easylife.app.documents;

import com.easylife.app.documents.payload.DocumentFilter;
import com.easylife.app.documents.payload.DocumentRequest;
import com.easylife.app.documents.payload.DocumentResponse;
import com.easylife.app.shared.payload.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping("/presigned-url")
    public ResponseEntity<String> generateUploadUrl(
            @RequestParam Long userId,
            @RequestParam String fileName,
            @RequestParam String contentType) {
        return ResponseEntity.ok(documentService.generateUploadUrl(userId, fileName, contentType));
    }

    @PostMapping("/confirm-upload")
    public ResponseEntity<DocumentResponse> confirmUpload(
            @RequestBody @Valid DocumentRequest request,
            @RequestParam Long userId,
            @RequestParam String filePath) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(documentService.create(request, userId, filePath));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentResponse> findById(
            @PathVariable Long id,
            @RequestParam Long userId) {
        return ResponseEntity.ok(documentService.findById(id, userId));
    }

    @GetMapping
    public ResponseEntity<PageResponse<DocumentResponse>> findAll(
            @RequestParam Long userId,
            @ModelAttribute DocumentFilter filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(documentService.findAll(userId, filter, page, size));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DocumentResponse> update(
            @PathVariable Long id,
            @RequestBody @Valid DocumentRequest request,
            @RequestParam Long userId) {
        return ResponseEntity.ok(documentService.update(id, request, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestParam Long userId) {
        documentService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }

}
