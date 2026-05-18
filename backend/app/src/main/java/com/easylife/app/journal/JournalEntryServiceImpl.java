package com.easylife.app.journal;

import com.easylife.app.categories.api.CategoryApi;
import com.easylife.app.journal.api.JournalEntryRequest;
import com.easylife.app.journal.api.JournalEntryResponse;
import com.easylife.app.journal.api.JournalFilter;
import com.easylife.app.shared.payload.PageResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
class JournalEntryServiceImpl implements JournalEntryService {

    private final JournalEntryRepository journalEntryRepository;
    private final JournalEntryMapper journalEntryMapper;
    private final CategoryApi categoryApi;

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
    public JournalEntryResponse create(JournalEntryRequest request, Long userId) {
        if (journalEntryRepository.existsByEntryDateAndUserId(request.entryDate(), userId)) {
            throw new IllegalArgumentException("Journal entry already exists for this date");
        }
        validateCategories(request.categoryIds(), userId);
        JournalEntry entry = journalEntryMapper.toEntity(request, userId);
        entry.setCreatedAt(LocalDateTime.now());
        return journalEntryMapper.toResponse(journalEntryRepository.save(entry));
    }

    @Override
    public JournalEntryResponse findById(Long id, Long userId) {
        return journalEntryRepository.findByIdAndUserId(id, userId)
                .map(journalEntryMapper::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Journal entry not found"));
    }

    @Override
    public JournalEntryResponse findByDate(LocalDate date, Long userId) {
        return journalEntryRepository.findByEntryDateAndUserId(date, userId)
                .map(journalEntryMapper::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Journal entry not found for this date"));
    }

    @Override
    public PageResponse<JournalEntryResponse> findAll(Long userId, JournalFilter filter, int page, int size) {
        Specification<JournalEntry> spec = JournalEntrySpecification.build(userId, filter);
        Page<JournalEntry> result = journalEntryRepository.findAll(spec, PageRequest.of(page, size,
                Sort.by("entryDate").descending()));
        return new PageResponse<>(
                result.getContent().stream().map(journalEntryMapper::toResponse).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    @Override
    public JournalEntryResponse update(Long id, JournalEntryRequest request, Long userId) {
        JournalEntry entry = journalEntryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Journal entry not found"));
        validateCategories(request.categoryIds(), userId);
        journalEntryMapper.update(entry, request);
        entry.setUpdatedAt(LocalDateTime.now());
        return journalEntryMapper.toResponse(journalEntryRepository.save(entry));
    }

    @Override
    public void delete(Long id, Long userId) {
        JournalEntry entry = journalEntryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Journal entry not found"));
        journalEntryRepository.delete(entry);
    }

}
