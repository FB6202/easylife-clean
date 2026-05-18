package com.easylife.app.weekplan;

import com.easylife.app.shared.payload.PageResponse;
import com.easylife.app.weekplan.api.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
class WeekPlanServiceImpl implements WeekPlanService, WeekPlanApi {

    private final WeekPlanRepository weekPlanRepository;
    private final WeekPlanItemRepository weekPlanItemRepository;
    private final WeekPlanMapper mapper;

    WeekPlanServiceImpl(
            WeekPlanRepository weekPlanRepository,
            WeekPlanItemRepository weekPlanItemRepository,
            WeekPlanMapper mapper
    ) {
        this.weekPlanRepository = weekPlanRepository;
        this.weekPlanItemRepository = weekPlanItemRepository;
        this.mapper = mapper;
    }

    @Override
    public PageResponse<WeekPlanResponse> findAll(Long userId, int page, int size, WeekPlanFilter filter) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "startDate"));
        Page<WeekPlan> result = weekPlanRepository.findAll(
                WeekPlanSpecification.build(userId, filter), pageRequest
        );
        return new PageResponse<>(
                result.getContent().stream().map(mapper::toResponse).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    @Override
    public WeekPlanResponse findById(Long id, Long userId) {
        return mapper.toResponse(getWeekPlan(id, userId));
    }

    @Override
    @Transactional
    public WeekPlanResponse create(WeekPlanRequest request, Long userId) {
        WeekPlan weekPlan = mapper.toEntity(request, userId);

        if (request.items() != null) {
            List<WeekPlanItem> items = request.items().stream()
                    .map(itemReq -> mapper.toItemEntity(itemReq, weekPlan))
                    .toList();
            weekPlan.getItems().addAll(items);
        }

        return mapper.toResponse(weekPlanRepository.save(weekPlan));
    }

    @Override
    @Transactional
    public WeekPlanResponse update(Long id, WeekPlanRequest request, Long userId) {
        WeekPlan weekPlan = getWeekPlan(id, userId);
        mapper.applyRequest(weekPlan, request);

        if (request.items() != null) {
            weekPlan.getItems().clear();
            List<WeekPlanItem> items = request.items().stream()
                    .map(itemReq -> mapper.toItemEntity(itemReq, weekPlan))
                    .toList();
            weekPlan.getItems().addAll(items);
        }

        return mapper.toResponse(weekPlanRepository.save(weekPlan));
    }

    @Override
    @Transactional
    public void delete(Long id, Long userId) {
        WeekPlan weekPlan = getWeekPlan(id, userId);
        weekPlanRepository.delete(weekPlan);
    }

    @Override
    @Transactional
    public WeekPlanResponse updateStatus(Long id, String status, Long userId) {
        WeekPlan weekPlan = getWeekPlan(id, userId);
        weekPlan.setStatus(com.easylife.app.shared.enums.WeekPlanStatus.valueOf(status));
        return mapper.toResponse(weekPlanRepository.save(weekPlan));
    }

    @Override
    @Transactional
    public WeekPlanResponse updateReflection(Long id, String reflection, Long userId) {
        WeekPlan weekPlan = getWeekPlan(id, userId);
        weekPlan.setReflection(reflection);
        return mapper.toResponse(weekPlanRepository.save(weekPlan));
    }

    // ── Items ──────────────────────────────────────────────

    @Override
    @Transactional
    public WeekPlanResponse addItem(Long weekPlanId, WeekPlanItemRequest request, Long userId) {
        WeekPlan weekPlan = getWeekPlan(weekPlanId, userId);
        WeekPlanItem item = mapper.toItemEntity(request, weekPlan);
        weekPlan.getItems().add(item);
        return mapper.toResponse(weekPlanRepository.save(weekPlan));
    }

    @Override
    @Transactional
    public WeekPlanResponse updateItem(Long weekPlanId, Long itemId, WeekPlanItemRequest request, Long userId) {
        WeekPlan weekPlan = getWeekPlan(weekPlanId, userId);
        WeekPlanItem item = getItem(weekPlan, itemId);
        mapper.applyItemRequest(item, request);
        return mapper.toResponse(weekPlanRepository.save(weekPlan));
    }

    @Override
    @Transactional
    public WeekPlanResponse toggleItem(Long weekPlanId, Long itemId, Long userId) {
        WeekPlan weekPlan = getWeekPlan(weekPlanId, userId);
        WeekPlanItem item = getItem(weekPlan, itemId);
        item.setDone(!item.getDone());
        return mapper.toResponse(weekPlanRepository.save(weekPlan));
    }

    @Override
    @Transactional
    public WeekPlanResponse removeItem(Long weekPlanId, Long itemId, Long userId) {
        WeekPlan weekPlan = getWeekPlan(weekPlanId, userId);
        weekPlan.getItems().removeIf(i -> i.getId().equals(itemId));
        return mapper.toResponse(weekPlanRepository.save(weekPlan));
    }

    // ── Helpers ────────────────────────────────────────────

    private WeekPlan getWeekPlan(Long id, Long userId) {
        return weekPlanRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "WeekPlan not found with id: " + id
                ));
    }

    private WeekPlanItem getItem(WeekPlan weekPlan, Long itemId) {
        return weekPlan.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException(
                        "WeekPlanItem not found with id: " + itemId
                ));
    }

    @Override
    public boolean existsByIdAndUserId(Long weekPlanId, Long userId) {
        return weekPlanRepository.findByIdAndUserId(weekPlanId, userId).isPresent();
    }

    @Override
    public WeekPlanSummary findById(Long weekPlanId) {
        return weekPlanRepository.findById(weekPlanId)
                .map(wp -> new WeekPlanSummary(
                        wp.getId(),
                        wp.getTitle(),
                        wp.getStartDate().toString(),
                        wp.getEndDate().toString()
                ))
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException(
                        "WeekPlan not found: " + weekPlanId
                ));
    }

}