package com.easylife.app.notifications;

import com.easylife.app.notifications.payload.NotificationFilter;
import com.easylife.app.notifications.payload.NotificationRequest;
import com.easylife.app.notifications.payload.NotificationResponse;
import com.easylife.app.shared.payload.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    public ResponseEntity<NotificationResponse> create(
            @RequestBody @Valid NotificationRequest request,
            @RequestParam Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(notificationService.create(request, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificationResponse> findById(
            @PathVariable Long id,
            @RequestParam Long userId) {
        return ResponseEntity.ok(notificationService.findById(id, userId));
    }

    @GetMapping
    public ResponseEntity<PageResponse<NotificationResponse>> findAll(
            @RequestParam Long userId,
            @ModelAttribute NotificationFilter filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(notificationService.findAll(userId, filter, page, size));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> findAllUnread(
            @RequestParam Long userId) {
        return ResponseEntity.ok(notificationService.findAllUnread(userId));
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Long> countUnread(
            @RequestParam Long userId) {
        return ResponseEntity.ok(notificationService.countUnread(userId));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable Long id,
            @RequestParam Long userId) {
        return ResponseEntity.ok(notificationService.markAsRead(id, userId));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @RequestParam Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestParam Long userId) {
        notificationService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }

}
