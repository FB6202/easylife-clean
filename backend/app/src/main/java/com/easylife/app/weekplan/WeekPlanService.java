package com.easylife.app.weekplan;

import com.easylife.app.shared.payload.PageResponse;
import com.easylife.app.weekplan.api.*;

public interface WeekPlanService {

    PageResponse<WeekPlanResponse> findAll(Long userId, int page, int size, WeekPlanFilter filter);

    WeekPlanResponse findById(Long id, Long userId);

    WeekPlanResponse create(WeekPlanRequest request, Long userId);

    WeekPlanResponse update(Long id, WeekPlanRequest request, Long userId);

    void delete(Long id, Long userId);

    WeekPlanResponse updateStatus(Long id, String status, Long userId);

    WeekPlanResponse updateReflection(Long id, String reflection, Long userId);

    // Items
    WeekPlanResponse addItem(Long weekPlanId, WeekPlanItemRequest request, Long userId);

    WeekPlanResponse updateItem(Long weekPlanId, Long itemId, WeekPlanItemRequest request, Long userId);

    WeekPlanResponse toggleItem(Long weekPlanId, Long itemId, Long userId);

    WeekPlanResponse removeItem(Long weekPlanId, Long itemId, Long userId);

}