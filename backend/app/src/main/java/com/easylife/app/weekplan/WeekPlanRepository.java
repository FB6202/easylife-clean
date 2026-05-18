package com.easylife.app.weekplan;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

interface WeekPlanRepository extends JpaRepository<WeekPlan, Long>, JpaSpecificationExecutor<WeekPlan> {

    Optional<WeekPlan> findByIdAndUserId(Long id, Long userId);

}
