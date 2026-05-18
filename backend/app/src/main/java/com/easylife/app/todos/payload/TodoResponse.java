package com.easylife.app.todos.payload;

import com.easylife.app.shared.enums.AccessType;
import com.easylife.app.shared.enums.Priority;
import com.easylife.app.shared.enums.TodoStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record TodoResponse(
        Long id,
        String title,
        String description,
        Priority priority,
        TodoStatus status,
        AccessType accessType,
        LocalDate dueDate,
        LocalDateTime createdAt,
        List<Long> categoryIds
) {}
