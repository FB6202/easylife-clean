package com.easylife.app.todos.payload;

import com.easylife.app.shared.enums.AccessType;
import com.easylife.app.shared.enums.Priority;
import com.easylife.app.shared.enums.TodoStatus;

import java.time.LocalDate;
import java.util.List;

public record TodoFilter(
        TodoStatus status,
        Priority priority,
        AccessType accessType,
        LocalDate dueDateFrom,
        LocalDate dueDateTo,
        List<Long> categoryIds
) {}
