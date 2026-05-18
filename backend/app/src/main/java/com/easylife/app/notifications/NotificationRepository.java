package com.easylife.app.notifications;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

interface NotificationRepository extends JpaRepository<Notification, Long>, JpaSpecificationExecutor<Notification> {

    List<Notification> findAllByUserIdAndAlreadyRead(Long userId, Boolean alreadyRead);

    List<Notification> findAllByScheduledAtBeforeAndSentAtIsNull(LocalDateTime now);

    long countByUserIdAndAlreadyRead(Long userId, Boolean alreadyRead);

    Optional<Notification> findByIdAndUserId(Long id, Long userId);

}
