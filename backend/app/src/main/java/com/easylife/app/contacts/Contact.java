package com.easylife.app.contacts;

import com.easylife.app.shared.enums.RelationshipType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "contacts")
class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String firstname;
    @Column(nullable = false)
    private String lastname;
    private String company;
    private String position;
    private String email;
    private String phone;
    private String linkedinUrl;
    private String websiteUrl;
    private String notes;
    private String tags;
    private LocalDate lastContactedAt;
    @Column(nullable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    private RelationshipType relationshipType;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "contact")
    private List<ContactNote> contactNotes;
    @Column(nullable = false)
    private Long userId;
    @ElementCollection
    @CollectionTable(name = "contact_categories",
            joinColumns = @JoinColumn(name = "contact_id"))
    @Column(name = "category_id")
    private List<Long> categoryIds;

}
