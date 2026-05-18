package com.easylife.app.contacts;

import com.easylife.app.contacts.payload.ContactNoteRequest;
import com.easylife.app.contacts.payload.ContactNoteResponse;
import com.easylife.app.contacts.payload.ContactRequest;
import com.easylife.app.contacts.payload.ContactResponse;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;

@Component
class ContactMapper {

    public ContactResponse toResponse(Contact contact) {
        return new ContactResponse(
                contact.getId(),
                contact.getFirstname(),
                contact.getLastname(),
                contact.getCompany(),
                contact.getPosition(),
                contact.getEmail(),
                contact.getPhone(),
                contact.getLinkedinUrl(),
                contact.getWebsiteUrl(),
                contact.getNotes(),
                contact.getTags(),
                contact.getLastContactedAt(),
                contact.getCreatedAt(),
                contact.getRelationshipType(),
                contact.getContactNotes() != null
                        ? contact.getContactNotes().stream().map(this::toNoteResponse).toList()
                        : new ArrayList<>(),
                contact.getCategoryIds()
        );
    }

    public ContactNoteResponse toNoteResponse(ContactNote note) {
        return new ContactNoteResponse(
                note.getId(),
                note.getContent(),
                note.getCreatedAt()
        );
    }

    public Contact toEntity(ContactRequest request, Long userId) {
        return Contact.builder()
                .firstname(request.firstname())
                .lastname(request.lastname())
                .company(request.company())
                .position(request.position())
                .email(request.email())
                .phone(request.phone())
                .linkedinUrl(request.linkedinUrl())
                .websiteUrl(request.websiteUrl())
                .notes(request.notes())
                .tags(request.tags())
                .lastContactedAt(request.lastContactedAt())
                .relationshipType(request.relationshipType())
                .createdAt(LocalDateTime.now())
                .userId(userId)
                .categoryIds(request.categoryIds() != null ? request.categoryIds() : new ArrayList<>())
                .contactNotes(new ArrayList<>())
                .build();
    }

    public ContactNote toNoteEntity(ContactNoteRequest request, Contact contact) {
        return ContactNote.builder()
                .content(request.content())
                .createdAt(LocalDateTime.now())
                .contact(contact)
                .build();
    }

    public void update(Contact contact, ContactRequest request) {
        contact.setFirstname(request.firstname());
        contact.setLastname(request.lastname());
        contact.setCompany(request.company());
        contact.setPosition(request.position());
        contact.setEmail(request.email());
        contact.setPhone(request.phone());
        contact.setLinkedinUrl(request.linkedinUrl());
        contact.setWebsiteUrl(request.websiteUrl());
        contact.setNotes(request.notes());
        contact.setTags(request.tags());
        contact.setLastContactedAt(request.lastContactedAt());
        contact.setRelationshipType(request.relationshipType());
        contact.setCategoryIds(request.categoryIds() != null ? request.categoryIds() : new ArrayList<>());
    }

}
