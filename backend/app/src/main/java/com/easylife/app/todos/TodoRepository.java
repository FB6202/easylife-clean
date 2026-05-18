package com.easylife.app.todos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

interface TodoRepository extends JpaRepository<Todo, Long>, JpaSpecificationExecutor<Todo> {

    Optional<Todo> findByIdAndUserId(Long id, Long userId);

    List<Todo> findAllByUserIdAndDueDateBefore(Long userId, LocalDate date);

}
