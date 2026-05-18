package com.easylife.app.documents;

import com.easylife.app.documents.payload.DocumentRequest;
import com.easylife.app.documents.payload.DocumentResponse;
import com.easylife.app.shared.enums.AccessType;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;

@Component
class DocumentMapper {

    public DocumentResponse toResponse(Document document, String presignedUrl) {
        return new DocumentResponse(
                document.getId(),
                document.getTitle(),
                document.getDescription(),
                document.getFileType(),
                document.getFileSizeBytes(),
                document.getAccessType(),
                document.getUploadedAt(),
                document.getCategoryIds(),
                presignedUrl
        );
    }

    public Document toEntity(DocumentRequest request, Long userId, String filePath) {
        return Document.builder()
                .title(request.title())
                .description(request.description())
                .filePath(filePath)
                .fileType(request.fileType())
                .fileSizeBytes(request.fileSizeBytes())
                .accessType(request.accessType() != null ? request.accessType() : AccessType.PRIVATE)
                .uploadedAt(LocalDateTime.now())
                .userId(userId)
                .categoryIds(request.categoryIds() != null ? request.categoryIds() : new ArrayList<>())
                .build();
    }

    public void update(Document document, DocumentRequest request) {
        document.setTitle(request.title());
        document.setDescription(request.description());
        document.setFileType(request.fileType());
        document.setFileSizeBytes(request.fileSizeBytes());
        document.setAccessType(request.accessType());
        document.setCategoryIds(request.categoryIds() != null ? request.categoryIds() : new ArrayList<>());
    }

}
