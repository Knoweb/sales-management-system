package com.knoweb.salesmanagement.notification.service;

import tools.jackson.databind.JsonNode;
import com.knoweb.salesmanagement.common.exception.ResourceNotFoundException;
import com.knoweb.salesmanagement.notification.dto.NotificationDTO;
import com.knoweb.salesmanagement.notification.entity.Notification;
import com.knoweb.salesmanagement.notification.repository.NotificationRepository;
import com.knoweb.salesmanagement.user.entity.User;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.context.ApplicationEventPublisher;
import com.knoweb.salesmanagement.notification.dto.InternalNotificationEvent;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private final NotificationRepository notificationRepository;
    private final ApplicationEventPublisher eventPublisher;

    public NotificationService(NotificationRepository notificationRepository, ApplicationEventPublisher eventPublisher) {
        this.notificationRepository = notificationRepository;
        this.eventPublisher = eventPublisher;
    }

    public void createNotification(User recipient, String eventType, String title, String message, 
                                   String entityType, UUID entityId, String contextUrl, 
                                   String deduplicationKey, JsonNode metadata) {
        InternalNotificationEvent event = new InternalNotificationEvent();
        event.setEventType(eventType);
        event.setTitle(title);
        event.setMessage(message);
        event.setEntityType(entityType);
        event.setEntityId(entityId);
        event.setContextUrl(contextUrl);
        event.setDeduplicationKey(deduplicationKey);
        event.setMetadata(metadata);
        if (recipient != null && recipient.getId() != null) {
            event.setRecipientUserIds(java.util.Set.of(recipient.getId()));
        }

        eventPublisher.publishEvent(event);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveNotification(User recipient, InternalNotificationEvent event) {
        if (event.getDeduplicationKey() != null && notificationRepository.existsByRecipientIdAndDeduplicationKey(recipient.getId(), event.getDeduplicationKey())) {
            log.debug("Skipping duplicate notification for user {} with key {}", recipient.getId(), event.getDeduplicationKey());
            return;
        }

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setEventType(event.getEventType());
        notification.setTitle(event.getTitle());
        notification.setMessage(event.getMessage());
        notification.setEntityType(event.getEntityType());
        notification.setEntityId(event.getEntityId());
        notification.setContextUrl(event.getContextUrl());
        notification.setDeduplicationKey(event.getDeduplicationKey());
        notification.setMetadata(event.getMetadata() != null ? event.getMetadata().toString() : null);

        try {
            notificationRepository.save(notification);
        } catch (DataIntegrityViolationException e) {
            log.warn("Notification deduplication key collision for user {} with key {}", recipient.getId(), event.getDeduplicationKey());
        }
    }

    public void createNotification(User recipient, String eventType, String title, String message, 
                                   String entityType, UUID entityId, String deduplicationKey) {
        createNotification(recipient, eventType, title, message, entityType, entityId, null, deduplicationKey, null);
    }

    @Transactional(readOnly = true)
    public Page<NotificationDTO> getUserNotifications(UUID userId, Boolean isRead, Pageable pageable) {
        Page<Notification> page;
        if (isRead != null) {
            page = notificationRepository.findByRecipientIdAndIsRead(userId, isRead, pageable);
        } else {
            page = notificationRepository.findByRecipientId(userId, pageable);
        }
        return page.map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(UUID userId, UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        
        if (!notification.getRecipient().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found");
        }

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(OffsetDateTime.now());
            notificationRepository.save(notification);
        }
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsReadForUser(userId, OffsetDateTime.now());
    }

    private NotificationDTO mapToDTO(Notification entity) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(entity.getId());
        dto.setEventType(entity.getEventType());
        dto.setTitle(entity.getTitle());
        dto.setMessage(entity.getMessage());
        dto.setEntityType(entity.getEntityType());
        dto.setEntityId(entity.getEntityId());
        dto.setContextUrl(entity.getContextUrl());
        dto.setRead(entity.isRead());
        dto.setReadAt(entity.getReadAt());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setMetadata(entity.getMetadata());
        return dto;
    }
}
