package com.knoweb.salesmanagement.notification.repository;

import com.knoweb.salesmanagement.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    
    Page<Notification> findByRecipientId(UUID recipientId, Pageable pageable);
    
    Page<Notification> findByRecipientIdAndIsRead(UUID recipientId, boolean isRead, Pageable pageable);
    
    long countByRecipientIdAndIsReadFalse(UUID recipientId);
    
    boolean existsByRecipientIdAndDeduplicationKey(UUID recipientId, String deduplicationKey);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.recipient.id = :recipientId AND n.isRead = false")
    int markAllAsReadForUser(@Param("recipientId") UUID recipientId, @Param("readAt") OffsetDateTime readAt);
}
