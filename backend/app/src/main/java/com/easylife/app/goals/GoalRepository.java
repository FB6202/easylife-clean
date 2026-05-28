package com.easylife.app.goals;

import com.easylife.app.shared.enums.AccessType;
import com.easylife.app.shared.enums.GoalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

interface GoalRepository extends JpaRepository<Goal, Long>, JpaSpecificationExecutor<Goal> {

    Optional<Goal> findByIdAndUserId(Long id, Long userId);

    long countByUserIdAndAccessType(Long userId, AccessType accessType);

    List<Goal> findAllByUserIdAndStatus(Long userId, GoalStatus status);

}
