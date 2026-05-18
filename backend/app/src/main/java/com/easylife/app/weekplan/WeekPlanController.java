package com.easylife.app.weekplan;

import com.easylife.app.shared.payload.PageResponse;
import com.easylife.app.weekplan.api.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/weekplans")
class WeekPlanController {

    private final WeekPlanService weekPlanService;

    WeekPlanController(WeekPlanService weekPlanService) {
        this.weekPlanService = weekPlanService;
    }

    @GetMapping
    ResponseEntity<PageResponse<WeekPlanResponse>> findAll(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @ModelAttribute WeekPlanFilter filter
    ) {
        return ResponseEntity.ok(weekPlanService.findAll(userId, page, size, filter));
    }

    @GetMapping("/{id}")
    ResponseEntity<WeekPlanResponse> findById(
            @PathVariable Long id,
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(weekPlanService.findById(id, userId));
    }

    @PostMapping
    ResponseEntity<WeekPlanResponse> create(
            @Valid @RequestBody WeekPlanRequest request,
            @RequestParam Long userId
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(weekPlanService.create(request, userId));
    }

    @PutMapping("/{id}")
    ResponseEntity<WeekPlanResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody WeekPlanRequest request,
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(weekPlanService.update(id, request, userId));
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestParam Long userId
    ) {
        weekPlanService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    ResponseEntity<WeekPlanResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(weekPlanService.updateStatus(id, status, userId));
    }

    @PatchMapping("/{id}/reflection")
    ResponseEntity<WeekPlanResponse> updateReflection(
            @PathVariable Long id,
            @RequestBody String reflection,
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(weekPlanService.updateReflection(id, reflection, userId));
    }

    // ── Items ──────────────────────────────────────────────

    @PostMapping("/{weekPlanId}/items")
    ResponseEntity<WeekPlanResponse> addItem(
            @PathVariable Long weekPlanId,
            @Valid @RequestBody WeekPlanItemRequest request,
            @RequestParam Long userId
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(weekPlanService.addItem(weekPlanId, request, userId));
    }

    @PutMapping("/{weekPlanId}/items/{itemId}")
    ResponseEntity<WeekPlanResponse> updateItem(
            @PathVariable Long weekPlanId,
            @PathVariable Long itemId,
            @Valid @RequestBody WeekPlanItemRequest request,
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(weekPlanService.updateItem(weekPlanId, itemId, request, userId));
    }

    @PatchMapping("/{weekPlanId}/items/{itemId}/toggle")
    ResponseEntity<WeekPlanResponse> toggleItem(
            @PathVariable Long weekPlanId,
            @PathVariable Long itemId,
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(weekPlanService.toggleItem(weekPlanId, itemId, userId));
    }

    @DeleteMapping("/{weekPlanId}/items/{itemId}")
    ResponseEntity<WeekPlanResponse> removeItem(
            @PathVariable Long weekPlanId,
            @PathVariable Long itemId,
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(weekPlanService.removeItem(weekPlanId, itemId, userId));
    }

}
