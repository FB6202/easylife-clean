package com.easylife.app.todos;

import com.easylife.app.shared.payload.PageResponse;
import com.easylife.app.todos.payload.TodoFilter;
import com.easylife.app.todos.payload.TodoRequest;
import com.easylife.app.todos.payload.TodoResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/todos")
@RequiredArgsConstructor
public class TodoController {

    private final TodoService todoService;

    @PostMapping
    public ResponseEntity<TodoResponse> create(
            @RequestBody @Valid TodoRequest request,
            @RequestParam Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(todoService.create(request, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TodoResponse> findById(
            @PathVariable Long id,
            @RequestParam Long userId) {
        return ResponseEntity.ok(todoService.findById(id, userId));
    }

    @GetMapping
    public ResponseEntity<PageResponse<TodoResponse>> findAll(
            @RequestParam Long userId,
            @ModelAttribute TodoFilter filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(todoService.findAll(userId, filter, page, size));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TodoResponse> update(
            @PathVariable Long id,
            @RequestBody @Valid TodoRequest request,
            @RequestParam Long userId) {
        return ResponseEntity.ok(todoService.update(id, request, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestParam Long userId) {
        todoService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }

}
