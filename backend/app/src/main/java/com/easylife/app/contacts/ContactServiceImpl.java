package com.easylife.app.contacts;

import com.easylife.app.categories.api.CategoryApi;
import com.easylife.app.contacts.payload.*;
import com.easylife.app.shared.payload.PageResponse;
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
class ContactServiceImpl implements ContactService {

    private final ContactRepository contactRepository;
    private final ContactNoteRepository contactNoteRepository;
    private final ContactMapper contactMapper;
    private final CategoryApi categoryApi;

    @Override
    public ContactResponse create(ContactRequest request, Long userId) {
        validateCategories(request.categoryIds(), userId);
        Contact contact = contactMapper.toEntity(request, userId);
        contact.setCreatedAt(LocalDateTime.now());
        return contactMapper.toResponse(contactRepository.save(contact));
    }

    @Override
    public ContactResponse findById(Long id, Long userId) {
        return contactRepository.findByIdAndUserId(id, userId)
                .map(contactMapper::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Contact not found"));
    }

    @Override
    public PageResponse<ContactResponse> findAll(Long userId, ContactFilter filter, int page, int size) {
        Specification<Contact> spec = ContactSpecification.build(userId, filter);
        Page<Contact> result = contactRepository.findAll(spec, PageRequest.of(page, size));
        return new PageResponse<>(
                result.getContent().stream().map(contactMapper::toResponse).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    @Override
    public ContactResponse update(Long id, ContactRequest request, Long userId) {
        Contact contact = contactRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Contact not found"));
        validateCategories(request.categoryIds(), userId);
        contactMapper.update(contact, request);
        contact.setUpdatedAt(LocalDateTime.now());
        return contactMapper.toResponse(contactRepository.save(contact));
    }

    @Override
    public void delete(Long id, Long userId) {
        Contact contact = contactRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Contact not found"));
        contactRepository.delete(contact);
    }

    @Override
    public ContactNoteResponse addNote(Long contactId, ContactNoteRequest request, Long userId) {
        Contact contact = contactRepository.findByIdAndUserId(contactId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Contact not found"));
        ContactNote note = contactMapper.toNoteEntity(request, contact);
        note.setCreatedAt(LocalDateTime.now());
        return contactMapper.toNoteResponse(contactNoteRepository.save(note));
    }

    @Override
    public ContactNoteResponse updateNote(Long contactId, Long noteId, ContactNoteRequest request, Long userId) {
        contactRepository.findByIdAndUserId(contactId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Contact not found"));
        ContactNote note = contactNoteRepository.findById(noteId)
                .orElseThrow(() -> new EntityNotFoundException("Note not found"));
        note.setContent(request.content());
        note.setUpdatedAt(LocalDateTime.now());
        return contactMapper.toNoteResponse(contactNoteRepository.save(note));
    }

    @Override
    public void deleteNote(Long contactId, Long noteId, Long userId) {
        contactRepository.findByIdAndUserId(contactId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Contact not found"));
        ContactNote note = contactNoteRepository.findById(noteId)
                .orElseThrow(() -> new EntityNotFoundException("Note not found"));
        contactNoteRepository.delete(note);
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

}
