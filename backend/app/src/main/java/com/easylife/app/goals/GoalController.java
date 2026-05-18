package com.easylife.app.goals;

import com.easylife.app.goals.payload.*;
import com.easylife.app.shared.payload.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @PostMapping
    public ResponseEntity<GoalResponse> create(
            @RequestBody @Valid GoalRequest request,
            @RequestParam Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(goalService.create(request, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoalResponse> findById(
            @PathVariable Long id,
            @RequestParam Long userId) {
        return ResponseEntity.ok(goalService.findById(id, userId));
    }

    @GetMapping
    public ResponseEntity<PageResponse<GoalResponse>> findAll(
            @RequestParam Long userId,
            @ModelAttribute GoalFilter filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(goalService.findAll(userId, filter, page, size));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoalResponse> update(
            @PathVariable Long id,
            @RequestBody @Valid GoalRequest request,
            @RequestParam Long userId) {
        return ResponseEntity.ok(goalService.update(id, request, userId));
    }

    @PatchMapping("/{id}/progress")
    public ResponseEntity<GoalResponse> updateProgress(
            @PathVariable Long id,
            @RequestParam Integer progress,
            @RequestParam Long userId) {
        return ResponseEntity.ok(goalService.updateProgress(id, progress, userId));
    }

    @PatchMapping("/{id}/image")
    public ResponseEntity<GoalResponse> updateImage(
            @PathVariable Long id,
            @RequestBody String imagePath,
            @RequestParam Long userId) {
        return ResponseEntity.ok(goalService.updateImage(id, imagePath, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestParam Long userId) {
        goalService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{goalId}/tasks")
    public ResponseEntity<GoalTaskResponse> addTask(
            @PathVariable Long goalId,
            @RequestBody @Valid GoalTaskRequest request,
            @RequestParam Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(goalService.addTask(goalId, request, userId));
    }

    @PutMapping("/{goalId}/tasks/{taskId}")
    public ResponseEntity<GoalTaskResponse> updateTask(
            @PathVariable Long goalId,
            @PathVariable Long taskId,
            @RequestBody @Valid GoalTaskRequest request,
            @RequestParam Long userId) {
        return ResponseEntity.ok(goalService.updateTask(goalId, taskId, request, userId));
    }

    @DeleteMapping("/{goalId}/tasks/{taskId}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long goalId,
            @PathVariable Long taskId,
            @RequestParam Long userId) {
        goalService.deleteTask(goalId, taskId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{goalId}/image/presigned-url")
    public ResponseEntity<String> generateImageUploadUrl(
            @PathVariable Long goalId,
            @RequestParam Long userId,
            @RequestParam String fileName,
            @RequestParam String contentType) {
        return ResponseEntity.ok(goalService.generateImageUploadUrl(goalId, userId, fileName, contentType));
    }

    @PatchMapping("/{goalId}/image/confirm")
    public ResponseEntity<GoalResponse> confirmImageUpload(
            @PathVariable Long goalId,
            @RequestParam Long userId,
            @RequestBody String imagePath) {
        return ResponseEntity.ok(goalService.updateImage(goalId, imagePath, userId));
    }

}
