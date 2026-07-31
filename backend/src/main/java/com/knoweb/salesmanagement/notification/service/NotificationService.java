package com.knoweb.salesmanagement.notification.service;

import com.knoweb.salesmanagement.notification.dto.NotificationDTO;
import com.knoweb.salesmanagement.notification.entity.Notification;
import com.knoweb.salesmanagement.notification.repository.NotificationRepository;
import com.knoweb.salesmanagement.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public void createNotification(User recipient, String type, String title, String message, String entityType, UUID entityId, String deduplicationKey) {
        if (deduplicationKey != null && notificationRepository.existsByDeduplicationKey(deduplicationKey)) {
            return; // Already notified
        }

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setNotificationType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setEntityType(entityType);
        notification.setEntityId(entityId);
        notification.setDeduplicationKey(deduplicationKey);

        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> getUserNotifications(UUID userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(UUID notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setReadAt(OffsetDateTime.now());
            notificationRepository.save(n);
        });
    }

    private NotificationDTO mapToDTO(Notification entity) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(entity.getId());
        dto.setNotificationType(entity.getNotificationType());
        dto.setTitle(entity.getTitle());
        dto.setMessage(entity.getMessage());
        dto.setEntityType(entity.getEntityType());
        dto.setEntityId(entity.getEntityId());
        dto.setRead(entity.getReadAt() != null);
        dto.setReadAt(entity.getReadAt());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
