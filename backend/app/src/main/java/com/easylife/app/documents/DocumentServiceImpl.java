package com.easylife.app.documents;

import com.easylife.app.categories.api.CategoryApi;
import com.easylife.app.documents.payload.DocumentFilter;
import com.easylife.app.documents.payload.DocumentRequest;
import com.easylife.app.documents.payload.DocumentResponse;
import com.easylife.app.shared.payload.PageResponse;
import com.easylife.app.storage.api.StorageApi;
import com.easylife.app.users.api.UserApi;
import com.easylife.app.users.api.UserResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentMapper documentMapper;
    private final CategoryApi categoryApi;
    private final StorageApi storageApi;
    private final UserApi userApi;

    @Override
    public DocumentResponse create(DocumentRequest request, Long userId, String filePath) {
        validateCategories(request.categoryIds(), userId);
        Document document = documentMapper.toEntity(request, userId, filePath);
        document.setUploadedAt(LocalDateTime.now());
        return documentMapper.toResponse(documentRepository.save(document), null);
    }

    @Override
    public DocumentResponse findById(Long id, Long userId) {
        Document document = documentRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found"));
        return documentMapper.toResponse(
                document,
                storageApi.generateDownloadUrl(document.getFilePath())
        );
    }

    @Override
    public PageResponse<DocumentResponse> findAll(Long userId, DocumentFilter filter, int page, int size) {
        Specification<Document> spec = DocumentSpecification.build(userId, filter);
        Page<Document> result = documentRepository.findAll(spec, PageRequest.of(page, size));
        return new PageResponse<>(
                result.getContent().stream()
                        .map(doc -> documentMapper.toResponse(
                                doc,
                                storageApi.generateDownloadUrl(doc.getFilePath())))
                        .toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    @Override
    public DocumentResponse update(Long id, DocumentRequest request, Long userId) {
        Document document = documentRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found"));
        validateCategories(request.categoryIds(), userId);
        documentMapper.update(document, request);
        document.setUpdatedAt(LocalDateTime.now());
        return documentMapper.toResponse(documentRepository.save(document), null);
    }

    @Override
    public void delete(Long id, Long userId) {
        Document document = documentRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found"));
        storageApi.delete(document.getFilePath());
        documentRepository.delete(document);
    }

    private void validateCategories(List<Long> categoryIds, Long userId) {
        if (categoryIds != null && !categoryIds.isEmpty()) {
            if (categoryIds.size() > 5) {
                throw new IllegalArgumentException("Maximum 5 categories allowed");
            }
            categoryIds.forEach(categoryId -> {
                if (!categoryApi.existsByIdAndUserId(categoryId, userId)) {
                    throw new EntityNotFoundException("Category not found: " + categoryId);
                }
            });
        }
    }

    @Override
    public String generateUploadUrl(Long userId, String fileName, String contentType) {
        UserResponse user = userApi.findById(userId);
        String key = storageApi.buildKey(
                user.username(),
                "documents",
                userId,
                fileName
        );
        return storageApi.generateUploadUrl(key, contentType);
    }

}
