package com.easylife.app.calendar;

import com.easylife.app.calendar.payload.CalendarEventRequest;
import com.easylife.app.calendar.payload.CalendarEventResponse;
import com.easylife.app.categories.api.CategoryApi;
import com.easylife.app.shared.enums.AccessType;
import com.easylife.app.shared.enums.EventType;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
class CalendarEventServiceImpl implements CalendarEventService {

    private final CalendarEventRepository calendarEventRepository;
    private final CalendarEventMapper calendarEventMapper;
    private final CategoryApi categoryApi;

    @Override
    public CalendarEventResponse create(CalendarEventRequest request, Long userId) {
        validateCategories(request.categoryIds(), userId);
        CalendarEvent event = calendarEventMapper.toEntity(request, userId);
        event.setCreatedAt(LocalDateTime.now());
        return calendarEventMapper.toResponse(calendarEventRepository.save(event));
    }

    @Override
    public CalendarEventResponse findById(Long id, Long userId) {
        return calendarEventRepository.findByIdAndUserId(id, userId)
                .map(calendarEventMapper::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Calendar event not found"));
    }

    @Override
    public List<CalendarEventResponse> findAll(Long userId) {
        return calendarEventRepository.findAllByUserId(userId)
                .stream()
                .map(calendarEventMapper::toResponse)
                .toList();
    }

    @Override
    public List<CalendarEventResponse> findAllByEventType(Long userId, EventType eventType) {
        return calendarEventRepository.findAllByUserIdAndEventType(userId, eventType)
                .stream()
                .map(calendarEventMapper::toResponse)
                .toList();
    }

    @Override
    public List<CalendarEventResponse> findAllByAccessType(Long userId, AccessType accessType) {
        return calendarEventRepository.findAllByUserIdAndAccessType(userId, accessType)
                .stream()
                .map(calendarEventMapper::toResponse)
                .toList();
    }

    @Override
    public List<CalendarEventResponse> findAllBetween(Long userId, LocalDateTime from, LocalDateTime to) {
        return calendarEventRepository.findAllByUserIdAndStartDateTimeBetween(userId, from, to)
                .stream()
                .map(calendarEventMapper::toResponse)
                .toList();
    }

    @Override
    public CalendarEventResponse update(Long id, CalendarEventRequest request, Long userId) {
        CalendarEvent event = calendarEventRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Calendar event not found"));
        validateCategories(request.categoryIds(), userId);
        calendarEventMapper.update(event, request);
        event.setUpdatedAt(LocalDateTime.now());
        return calendarEventMapper.toResponse(calendarEventRepository.save(event));
    }

    @Override
    public void delete(Long id, Long userId) {
        CalendarEvent event = calendarEventRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Calendar event not found"));
        calendarEventRepository.delete(event);
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
