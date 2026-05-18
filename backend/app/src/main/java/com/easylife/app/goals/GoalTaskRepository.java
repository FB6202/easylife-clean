package com.easylife.app.goals;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

interface GoalTaskRepository extends JpaRepository<GoalTask, Long> {

    List<GoalTask> findAllByGoalId(Long goalId);

    List<GoalTask> findAllByGoalIdAndDone(Long goalId, Boolean done);

    long countByGoalId(Long goalId);

    long countByGoalIdAndDone(Long goalId, Boolean done);

}
