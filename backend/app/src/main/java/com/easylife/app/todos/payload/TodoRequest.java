package com.easylife.app.todos.payload;

import com.easylife.app.shared.enums.AccessType;
import com.easylife.app.shared.enums.Priority;
import com.easylife.app.shared.enums.TodoStatus;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.util.List;

public record TodoRequest(
        @NotBlank String title,
        String description,
        Priority priority,
        TodoStatus status,
        AccessType accessType,
        LocalDate dueDate,
        List<Long> categoryIds
) {}
