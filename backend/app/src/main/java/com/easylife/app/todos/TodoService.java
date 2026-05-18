package com.easylife.app.todos;

import com.easylife.app.shared.payload.PageResponse;
import com.easylife.app.todos.payload.TodoFilter;
import com.easylife.app.todos.payload.TodoRequest;
import com.easylife.app.todos.payload.TodoResponse;

public interface TodoService {

    TodoResponse create(TodoRequest request, Long userId);

    TodoResponse findById(Long id, Long userId);

    PageResponse<TodoResponse> findAll(Long userId, TodoFilter filter, int page, int size);

    TodoResponse update(Long id, TodoRequest request, Long userId);

    void delete(Long id, Long userId);

}
