package com.easylife.app.notifications;

import com.easylife.app.notifications.payload.NotificationFilter;
import com.easylife.app.notifications.payload.NotificationRequest;
import com.easylife.app.notifications.payload.NotificationResponse;
import com.easylife.app.shared.payload.PageResponse;

import java.util.List;

public interface NotificationService {

    NotificationResponse create(NotificationRequest request, Long userId);

    NotificationResponse findById(Long id, Long userId);

    PageResponse<NotificationResponse> findAll(Long userId, NotificationFilter filter, int page, int size);

    List<NotificationResponse> findAllUnread(Long userId);

    NotificationResponse markAsRead(Long id, Long userId);

    void markAllAsRead(Long userId);

    void delete(Long id, Long userId);

    long countUnread(Long userId);

}
