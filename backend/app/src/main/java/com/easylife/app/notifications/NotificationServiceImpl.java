package com.easylife.app.notifications;

import com.easylife.app.notifications.payload.NotificationFilter;
import com.easylife.app.notifications.payload.NotificationRequest;
import com.easylife.app.notifications.payload.NotificationResponse;
import com.easylife.app.shared.enums.NotificationChannel;
import com.easylife.app.shared.enums.NotificationType;
import com.easylife.app.shared.payload.PageResponse;
import com.easylife.app.users.api.UserApi;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final UserApi userApi;

    @Override
    public NotificationResponse create(NotificationRequest request, Long userId) {
        if (!userApi.existsById(userId)) {
            throw new EntityNotFoundException("User not found");
        }
        Notification notification = notificationMapper.toEntity(request, userId);
        notification.setCreatedAt(LocalDateTime.now());
        return notificationMapper.toResponse(notificationRepository.save(notification));
    }

    @Override
    public NotificationResponse findById(Long id, Long userId) {
        return notificationRepository.findByIdAndUserId(id, userId)
                .map(notificationMapper::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Notification not found"));
    }

    @Override
    public PageResponse<NotificationResponse> findAll(Long userId, NotificationFilter filter, int page, int size) {
        Specification<Notification> spec = NotificationSpecification.build(userId, filter);
        Page<Notification> result = notificationRepository.findAll(
                spec, PageRequest.of(page, size, Sort.by("createdAt").descending())
        );
        return new PageResponse<>(
                result.getContent().stream().map(notificationMapper::toResponse).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    @Override
    public List<NotificationResponse> findAllUnread(Long userId) {
        return notificationRepository.findAllByUserIdAndAlreadyRead(userId, false)
                .stream()
                .map(notificationMapper::toResponse)
                .toList();
    }

    @Override
    public NotificationResponse markAsRead(Long id, Long userId) {
        Notification notification = notificationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Notification not found"));
        notificationMapper.markAsRead(notification);
        notification.setUpdatedAt(LocalDateTime.now());
        return notificationMapper.toResponse(notificationRepository.save(notification));
    }

    @Override
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findAllByUserIdAndAlreadyRead(userId, false);
        unread.forEach(n -> {
            notificationMapper.markAsRead(n);
            n.setUpdatedAt(LocalDateTime.now());
        });
        notificationRepository.saveAll(unread);
    }

    @Override
    public void delete(Long id, Long userId) {
        Notification notification = notificationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Notification not found"));
        notificationRepository.delete(notification);
    }

    @Override
    public long countUnread(Long userId) {
        return notificationRepository.countByUserIdAndAlreadyRead(userId, false);
    }

}
