package com.easylife.app.weekplan;

import com.easylife.app.shared.payload.PageResponse;
import com.easylife.app.weekplan.api.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/weekplans")
@RequiredArgsConstructor
public class WeekPlanController {

    private final WeekPlanService service;

    @GetMapping
    public ResponseEntity<PageResponse<WeekPlanResponse>> findAll(
            @RequestParam Long userId,
            @ModelAttribute WeekPlanFilter filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(service.findAll(userId, page, size, filter));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<WeekPlanResponse> findDashboard(@RequestParam Long userId) {
        WeekPlanResponse dashboard = service.findDashboard(userId);
        return dashboard != null ? ResponseEntity.ok(dashboard) : ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<WeekPlanResponse> findById(@PathVariable Long id, @RequestParam Long userId) {
        return ResponseEntity.ok(service.findById(id, userId));
    }

    @PostMapping
    public ResponseEntity<WeekPlanResponse> create(@RequestBody @Valid WeekPlanRequest request, @RequestParam Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WeekPlanResponse> update(@PathVariable Long id, @RequestBody @Valid WeekPlanRequest request, @RequestParam Long userId) {
        return ResponseEntity.ok(service.update(id, request, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @RequestParam Long userId) {
        service.delete(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<WeekPlanResponse> updateStatus(@PathVariable Long id, @RequestParam String status, @RequestParam Long userId) {
        return ResponseEntity.ok(service.updateStatus(id, status, userId));
    }

    @PatchMapping("/{id}/reflection")
    public ResponseEntity<WeekPlanResponse> updateReflection(@PathVariable Long id, @RequestBody String reflection, @RequestParam Long userId) {
        return ResponseEntity.ok(service.updateReflection(id, reflection, userId));
    }

    @PostMapping("/{weekPlanId}/items")
    public ResponseEntity<WeekPlanResponse> addItem(@PathVariable Long weekPlanId, @RequestBody @Valid WeekPlanItemRequest request, @RequestParam Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.addItem(weekPlanId, request, userId));
    }

    @PutMapping("/{weekPlanId}/items/{itemId}")
    public ResponseEntity<WeekPlanResponse> updateItem(@PathVariable Long weekPlanId, @PathVariable Long itemId, @RequestBody @Valid WeekPlanItemRequest request, @RequestParam Long userId) {
        return ResponseEntity.ok(service.updateItem(weekPlanId, itemId, request, userId));
    }

    @PatchMapping("/{weekPlanId}/items/{itemId}/toggle")
    public ResponseEntity<WeekPlanResponse> toggleItem(@PathVariable Long weekPlanId, @PathVariable Long itemId, @RequestParam Long userId) {
        return ResponseEntity.ok(service.toggleItem(weekPlanId, itemId, userId));
    }

    @DeleteMapping("/{weekPlanId}/items/{itemId}")
    public ResponseEntity<WeekPlanResponse> removeItem(@PathVariable Long weekPlanId, @PathVariable Long itemId, @RequestParam Long userId) {
        return ResponseEntity.ok(service.removeItem(weekPlanId, itemId, userId));
    }

}
