package com.easylife.app.weekplan.api;

import org.springframework.modulith.NamedInterface;

@NamedInterface("api")
public interface WeekPlanApi {

    boolean existsByIdAndUserId(Long weekPlanId, Long userId);

    WeekPlanSummary findById(Long weekPlanId);

}
