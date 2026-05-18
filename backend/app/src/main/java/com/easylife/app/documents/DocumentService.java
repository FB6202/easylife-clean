package com.easylife.app.documents;

import com.easylife.app.documents.payload.DocumentFilter;
import com.easylife.app.documents.payload.DocumentRequest;
import com.easylife.app.documents.payload.DocumentResponse;
import com.easylife.app.shared.payload.PageResponse;

public interface DocumentService {

    DocumentResponse create(DocumentRequest request, Long userId, String filePath);

    DocumentResponse findById(Long id, Long userId);

    PageResponse<DocumentResponse> findAll(Long userId, DocumentFilter filter, int page, int size);

    DocumentResponse update(Long id, DocumentRequest request, Long userId);

    void delete(Long id, Long userId);

    String generateUploadUrl(Long userId, String fileName, String contentType);

}
