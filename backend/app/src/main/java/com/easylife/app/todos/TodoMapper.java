package com.easylife.app.todos;

import com.easylife.app.shared.enums.AccessType;
import com.easylife.app.shared.enums.TodoStatus;
import com.easylife.app.todos.payload.TodoRequest;
import com.easylife.app.todos.payload.TodoResponse;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;

@Component
class TodoMapper {

    public TodoResponse toResponse(Todo todo) {
        return new TodoResponse(
                todo.getId(),
                todo.getTitle(),
                todo.getDescription(),
                todo.getPriority(),
                todo.getStatus(),
                todo.getAccessType(),
                todo.getDueDate(),
                todo.getCreatedAt(),
                todo.getCategoryIds()
        );
    }

    public Todo toEntity(TodoRequest request, Long userId) {
        return Todo.builder()
                .title(request.title())
                .description(request.description())
                .priority(request.priority())
                .status(request.status() != null ? request.status() : TodoStatus.OPEN)
                .accessType(request.accessType() != null ? request.accessType() : AccessType.PRIVATE)
                .dueDate(request.dueDate())
                .createdAt(LocalDateTime.now())
                .userId(userId)
                .categoryIds(request.categoryIds() != null ? request.categoryIds() : new ArrayList<>())
                .build();
    }

    public void update(Todo todo, TodoRequest request) {
        todo.setTitle(request.title());
        todo.setDescription(request.description());
        todo.setPriority(request.priority());
        todo.setStatus(request.status());
        todo.setAccessType(request.accessType());
        todo.setDueDate(request.dueDate());
        todo.setCategoryIds(request.categoryIds() != null ? request.categoryIds() : new ArrayList<>());
    }

}
