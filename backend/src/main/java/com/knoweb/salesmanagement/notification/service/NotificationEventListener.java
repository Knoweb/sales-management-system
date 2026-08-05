package com.knoweb.salesmanagement.notification.service;

import com.knoweb.salesmanagement.notification.dto.InternalNotificationEvent;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.UUID;

@Component
public class NotificationEventListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventListener.class);
    
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationEventListener(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleNotificationEvent(InternalNotificationEvent event) {
        if (event.getRecipientUserIds() == null || event.getRecipientUserIds().isEmpty()) {
            log.warn("Notification event {} has no recipients. Skipping.", event.getEventId());
            return;
        }

        for (UUID recipientId : event.getRecipientUserIds()) {
            if (recipientId == null) continue;

            userRepository.findById(recipientId).ifPresentOrElse(user -> {
                try {
                    notificationService.saveNotification(user, event);
                } catch (Exception e) {
                    log.error("Failed to create notification for user {} on event {}", recipientId, event.getEventId(), e);
                }
            }, () -> {
                log.warn("Recipient user {} not found for notification event {}", recipientId, event.getEventId());
            });
        }
    }
}
