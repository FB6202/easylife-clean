package com.easylife.app.documents;

import com.easylife.app.shared.enums.AccessType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "documents")
class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String title;
    private String description;
    @Column(nullable = false)
    private String filePath;
    @Column(nullable = false)
    private String fileType;
    private Long fileSizeBytes;
    @Column(nullable = false)
    private LocalDateTime uploadedAt;
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    private AccessType accessType;

    @Column(nullable = false)
    private Long userId;
    @ElementCollection
    @CollectionTable(name = "document_categories",
            joinColumns = @JoinColumn(name = "document_id"))
    @Column(name = "category_id")
    private List<Long> categoryIds;

}
