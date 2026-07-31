package com.knoweb.salesmanagement.notification.repository;

import com.knoweb.salesmanagement.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(UUID recipientId);
    boolean existsByDeduplicationKey(String deduplicationKey);
}
