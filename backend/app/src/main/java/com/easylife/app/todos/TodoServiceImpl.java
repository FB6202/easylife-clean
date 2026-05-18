package com.easylife.app.todos;

import com.easylife.app.categories.api.CategoryApi;
import com.easylife.app.shared.payload.PageResponse;
import com.easylife.app.todos.payload.TodoFilter;
import com.easylife.app.todos.payload.TodoRequest;
import com.easylife.app.todos.payload.TodoResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
class TodoServiceImpl implements TodoService {

    private final TodoRepository todoRepository;
    private final TodoMapper todoMapper;
    private final CategoryApi categoryApi;

    @Override
    public TodoResponse create(TodoRequest request, Long userId) {
        validateCategories(request.categoryIds(), userId);
        Todo todo = todoMapper.toEntity(request, userId);
        todo.setCreatedAt(LocalDateTime.now());
        return todoMapper.toResponse(todoRepository.save(todo));
    }

    @Override
    public TodoResponse findById(Long id, Long userId) {
        return todoRepository.findByIdAndUserId(id, userId)
                .map(todoMapper::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Todo not found"));
    }

    @Override
    public PageResponse<TodoResponse> findAll(Long userId, TodoFilter filter, int page, int size) {
        Specification<Todo> spec = TodoSpecification.build(userId, filter);
        Page<Todo> result = todoRepository.findAll(spec, PageRequest.of(page, size));
        return new PageResponse<>(
                result.getContent().stream().map(todoMapper::toResponse).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    @Override
    public TodoResponse update(Long id, TodoRequest request, Long userId) {
        Todo todo = todoRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Todo not found"));
        validateCategories(request.categoryIds(), userId);
        todoMapper.update(todo, request);
        todo.setUpdatedAt(LocalDateTime.now());
        return todoMapper.toResponse(todoRepository.save(todo));
    }

    @Override
    public void delete(Long id, Long userId) {
        Todo todo = todoRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Todo not found"));
        todoRepository.delete(todo);
    }

    private void validateCategories(List<Long> categoryIds, Long userId) {
        if (categoryIds != null && !categoryIds.isEmpty()) {
            if (categoryIds.size() > 5) {
                throw new IllegalArgumentException("Maximum 5 categories allowed");
            }
            categoryIds.forEach(categoryId -> {
                if (!categoryApi.existsByIdAndUserId(categoryId, userId)) {
                    throw new EntityNotFoundException("Category not found: " + categoryId);
                }
            });
        }
    }

}
