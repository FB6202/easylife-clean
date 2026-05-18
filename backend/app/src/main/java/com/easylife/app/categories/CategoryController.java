package com.easylife.app.categories;

import com.easylife.app.categories.payload.CategoryRequest;
import com.easylife.app.categories.payload.CategoryResponse;
import com.easylife.app.shared.enums.AccessType;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<CategoryResponse> create(
            @RequestBody @Valid CategoryRequest request,
            @RequestParam Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categoryService.create(request, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> findById(
            @PathVariable Long id,
            @RequestParam Long userId) {
        return ResponseEntity.ok(categoryService.findById(id, userId));
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> findAll(
            @RequestParam Long userId) {
        return ResponseEntity.ok(categoryService.findAll(userId));
    }

    @GetMapping("/access-type")
    public ResponseEntity<List<CategoryResponse>> findAllByAccessType(
            @RequestParam Long userId,
            @RequestParam AccessType accessType) {
        return ResponseEntity.ok(categoryService.findAllByAccessType(userId, accessType));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> update(
            @PathVariable Long id,
            @RequestBody @Valid CategoryRequest request,
            @RequestParam Long userId) {
        return ResponseEntity.ok(categoryService.update(id, request, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestParam Long userId) {
        categoryService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }

}
