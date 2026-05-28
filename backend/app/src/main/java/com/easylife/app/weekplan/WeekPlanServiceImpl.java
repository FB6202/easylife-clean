package com.easylife.app.weekplan;

import com.easylife.app.categories.api.CategoryApi;
import com.easylife.app.shared.enums.WeekPlanStatus;
import com.easylife.app.shared.payload.PageResponse;
import com.easylife.app.weekplan.api.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
class WeekPlanServiceImpl implements WeekPlanService, WeekPlanApi {

    private final WeekPlanRepository     weekPlanRepository;
    private final WeekPlanMapper         mapper;
    private final CategoryApi            categoryApi;

    @Override
    public PageResponse<WeekPlanResponse> findAll(Long userId, int page, int size, WeekPlanFilter filter) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "startDate"));
        Page<WeekPlan> result = weekPlanRepository.findAll(
                WeekPlanSpecification.build(userId, filter), pageRequest);
        return new PageResponse<>(
                result.getContent().stream()
                        .map(wp -> mapper.toResponse(wp,
                                categoryApi.findPreviewsByIds(wp.getCategoryIds())))
                        .toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    @Override
    public WeekPlanResponse findById(Long id, Long userId) {
        WeekPlan wp = getWeekPlan(id, userId);
        return mapper.toResponse(wp, categoryApi.findPreviewsByIds(wp.getCategoryIds()));
    }

    @Override
    @Transactional
    public WeekPlanResponse create(WeekPlanRequest request, Long userId) {
        WeekPlan weekPlan = mapper.toEntity(request, userId);
        if (request.items() != null) {
            weekPlan.getItems().addAll(request.items().stream()
                    .map(i -> mapper.toItemEntity(i, weekPlan)).toList());
        }
        WeekPlan saved = weekPlanRepository.save(weekPlan);
        return mapper.toResponse(saved, categoryApi.findPreviewsByIds(saved.getCategoryIds()));
    }

    @Override
    @Transactional
    public WeekPlanResponse update(Long id, WeekPlanRequest request, Long userId) {
        WeekPlan weekPlan = getWeekPlan(id, userId);
        mapper.applyRequest(weekPlan, request);
        if (request.items() != null) {
            weekPlan.getItems().clear();
            weekPlan.getItems().addAll(request.items().stream()
                    .map(i -> mapper.toItemEntity(i, weekPlan)).toList());
        }
        WeekPlan saved = weekPlanRepository.save(weekPlan);
        return mapper.toResponse(saved, categoryApi.findPreviewsByIds(saved.getCategoryIds()));
    }

    @Override
    @Transactional
    public void delete(Long id, Long userId) {
        weekPlanRepository.delete(getWeekPlan(id, userId));
    }

    @Override
    @Transactional
    public WeekPlanResponse updateStatus(Long id, String status, Long userId) {
        WeekPlan wp = getWeekPlan(id, userId);
        wp.setStatus(WeekPlanStatus.valueOf(status));
        WeekPlan saved = weekPlanRepository.save(wp);
        return mapper.toResponse(saved, categoryApi.findPreviewsByIds(saved.getCategoryIds()));
    }

    @Override
    @Transactional
    public WeekPlanResponse updateReflection(Long id, String reflection, Long userId) {
        WeekPlan wp = getWeekPlan(id, userId);
        wp.setReflection(reflection);
        WeekPlan saved = weekPlanRepository.save(wp);
        return mapper.toResponse(saved, categoryApi.findPreviewsByIds(saved.getCategoryIds()));
    }

    @Override
    @Transactional
    public WeekPlanResponse addItem(Long weekPlanId, WeekPlanItemRequest request, Long userId) {
        WeekPlan wp = getWeekPlan(weekPlanId, userId);
        wp.getItems().add(mapper.toItemEntity(request, wp));
        WeekPlan saved = weekPlanRepository.save(wp);
        return mapper.toResponse(saved, categoryApi.findPreviewsByIds(saved.getCategoryIds()));
    }

    @Override
    @Transactional
    public WeekPlanResponse updateItem(Long weekPlanId, Long itemId, WeekPlanItemRequest request, Long userId) {
        WeekPlan wp = getWeekPlan(weekPlanId, userId);
        mapper.applyItemRequest(getItem(wp, itemId), request);
        WeekPlan saved = weekPlanRepository.save(wp);
        return mapper.toResponse(saved, categoryApi.findPreviewsByIds(saved.getCategoryIds()));
    }

    @Override
    @Transactional
    public WeekPlanResponse toggleItem(Long weekPlanId, Long itemId, Long userId) {
        WeekPlan wp = getWeekPlan(weekPlanId, userId);
        WeekPlanItem item = getItem(wp, itemId);
        item.setDone(!item.getDone());
        WeekPlan saved = weekPlanRepository.save(wp);
        return mapper.toResponse(saved, categoryApi.findPreviewsByIds(saved.getCategoryIds()));
    }

    @Override
    @Transactional
    public WeekPlanResponse removeItem(Long weekPlanId, Long itemId, Long userId) {
        WeekPlan wp = getWeekPlan(weekPlanId, userId);
        wp.getItems().removeIf(i -> i.getId().equals(itemId));
        WeekPlan saved = weekPlanRepository.save(wp);
        return mapper.toResponse(saved, categoryApi.findPreviewsByIds(saved.getCategoryIds()));
    }

    @Override
    public WeekPlanResponse findDashboard(Long userId) {
        // Current ACTIVE weekplan
        WeekPlanFilter filter = new WeekPlanFilter(WeekPlanStatus.ACTIVE, null, null, null);
        List<WeekPlan> plans = weekPlanRepository.findAll(WeekPlanSpecification.build(userId, filter));

        if (plans.isEmpty()) {
            return null;
        }

        WeekPlan activePlan = plans.get(0);
        return mapper.toResponse(activePlan, categoryApi.findPreviewsByIds(activePlan.getCategoryIds()));
    }

    private WeekPlan getWeekPlan(Long id, Long userId) {
        return weekPlanRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("WeekPlan not found: " + id));
    }

    private WeekPlanItem getItem(WeekPlan wp, Long itemId) {
        return wp.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("WeekPlanItem not found: " + itemId));
    }

    @Override
    public boolean existsByIdAndUserId(Long weekPlanId, Long userId) {
        return weekPlanRepository.existsByIdAndUserId(weekPlanId, userId);
    }

    @Override
    public WeekPlanSummary findById(Long weekPlanId) {
        return weekPlanRepository.findById(weekPlanId)
                .map(wp -> new WeekPlanSummary(
                        wp.getId(),
                        wp.getTitle(),
                        wp.getStartDate() != null ? wp.getStartDate().toString() : null,
                        wp.getEndDate()   != null ? wp.getEndDate().toString()   : null
                ))
                .orElse(null);
    }

}
