package com.knoweb.salesmanagement;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import com.knoweb.salesmanagement.audit.entity.AuditLog;
import com.knoweb.salesmanagement.audit.repository.AuditLogRepository;
import com.knoweb.salesmanagement.audit.service.AuditLogService;
import com.knoweb.salesmanagement.notification.dto.InternalNotificationEvent;
import com.knoweb.salesmanagement.notification.entity.Notification;
import com.knoweb.salesmanagement.notification.repository.NotificationRepository;
import com.knoweb.salesmanagement.notification.service.NotificationService;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@ActiveProfiles("test")
public class Phase19IntegrationTest {

    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private AuditLogService auditLogService;
    
    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JsonMapper jsonMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private User testUser;

    @BeforeEach
    void setup() {
        jdbcTemplate.execute("TRUNCATE TABLE audit_logs CASCADE");
        notificationRepository.deleteAllInBatch();
        
        testUser = userRepository.findByEmail("admin@knoweb.com").orElseGet(() -> {
            User u = new User();
            u.setEmail("admin@knoweb.com");
            u.setFirstName("Admin");
            u.setLastName("User");
            u.setPasswordHash("hash");
            return userRepository.save(u);
        });
    }

    @Test
    void testNotificationEventCreatesNotificationAndHandlesDeduplication() {
        InternalNotificationEvent event = new InternalNotificationEvent();
        event.setEventType("TEST_EVENT");
        event.setTitle("Test Title");
        event.setMessage("Test Message");
        event.setRecipientUserIds(Set.of(testUser.getId()));
        event.setDeduplicationKey("dedup-123");

        eventPublisher.publishEvent(event);

        // Verify creation
        var notifications = notificationRepository.findAll();
        assertThat(notifications).hasSize(1);
        assertThat(notifications.get(0).getTitle()).isEqualTo("Test Title");

        // Duplicate event
        eventPublisher.publishEvent(event);
        
        // Deduplication should prevent duplicate
        notifications = notificationRepository.findAll();
        assertThat(notifications).hasSize(1);
    }

    @Test
    void testNullRecipientIsSkippedSafely() {
        InternalNotificationEvent event = new InternalNotificationEvent();
        event.setEventType("TEST_EVENT");
        event.setTitle("Test Title");
        event.setMessage("Test Message");
        event.setRecipientUserIds(Set.of(UUID.randomUUID())); // Non-existent user

        eventPublisher.publishEvent(event);

        var notifications = notificationRepository.findAll();
        assertThat(notifications).isEmpty();
    }

    @Test
    void testMarkAsReadAndUnreadCount() {
        notificationService.createNotification(testUser, "TEST", "Title", "Message", null, null, null, null, null);
        
        var unreadCount = notificationService.getUnreadCount(testUser.getId());
        assertThat(unreadCount).isEqualTo(1);

        var page = notificationService.getUserNotifications(testUser.getId(), false, PageRequest.of(0, 10));
        assertThat(page.getTotalElements()).isEqualTo(1);

        UUID notificationId = page.getContent().get(0).getId();
        notificationService.markAsRead(testUser.getId(), notificationId);

        unreadCount = notificationService.getUnreadCount(testUser.getId());
        assertThat(unreadCount).isEqualTo(0);
    }
    
    @Test
    void testMarkAllAsRead() {
        notificationService.createNotification(testUser, "TEST", "Title 1", "Message", null, null, null, "k1", null);
        notificationService.createNotification(testUser, "TEST", "Title 2", "Message", null, null, null, "k2", null);
        
        assertThat(notificationService.getUnreadCount(testUser.getId())).isEqualTo(2);
        
        notificationService.markAllAsRead(testUser.getId());
        
        assertThat(notificationService.getUnreadCount(testUser.getId())).isEqualTo(0);
    }

    @Test
    void testAuditRecordIsCreatedAndSensitiveFieldsExcluded() throws Exception {
        Map<String, String> previousState = Map.of("password", "secret", "name", "old_name");
        Map<String, String> newState = Map.of("password", "new_secret", "name", "new_name");

        auditLogService.recordAudit("USER_UPDATED", "User", testUser.getId(), "UPDATE", previousState, newState, "Changed name", "corr-1", null);

        var auditLogs = auditLogRepository.findAll();
        assertThat(auditLogs).hasSize(1);
        
        AuditLog log = auditLogs.get(0);
        assertThat(log.getActorNameSnapshot()).isEqualTo("SYSTEM");
        
        JsonNode prev = jsonMapper.readTree(log.getPreviousState());
        assertThat(prev.has("password")).isFalse();
        assertThat(prev.get("name").asText()).isEqualTo("old_name");
        
        JsonNode curr = jsonMapper.readTree(log.getNewState());
        assertThat(curr.has("password")).isFalse();
        assertThat(curr.get("name").asText()).isEqualTo("new_name");
    }

    @Test
    void testDifferentRecipientsCanReceiveSameEvent() {
        User user2 = new User();
        user2.setEmail(("user" + UUID.randomUUID() + "@test.com"));
        user2.setFirstName("User2");
        user2.setLastName("Test");
        user2.setPasswordHash("hash");
        user2 = userRepository.save(user2);

        InternalNotificationEvent event = new InternalNotificationEvent();
        event.setEventType("TEST_EVENT");
        event.setTitle("Test Title");
        event.setMessage("Test Message");
        event.setRecipientUserIds(Set.of(testUser.getId(), user2.getId()));
        event.setDeduplicationKey("dedup-multi");

        eventPublisher.publishEvent(event);

        var notifications = notificationRepository.findAll();
        assertThat(notifications).hasSize(2);
    }

    @Test
    void testUsersCannotAccessAnotherUsersNotification() {
        notificationService.createNotification(testUser, "TEST", "Title", "Message", null, null, null, null, null);
        
        User user2 = new User();
        user2.setEmail(("user" + UUID.randomUUID() + "@test.com"));
        user2.setFirstName("User2");
        user2.setLastName("Test");
        user2.setPasswordHash("hash");
        user2 = userRepository.save(user2);

        var page = notificationService.getUserNotifications(user2.getId(), null, PageRequest.of(0, 10));
        assertThat(page.getTotalElements()).isEqualTo(0);
    }

    @Test
    void testAuditUpdateAndDeleteAreBlocked() {
        auditLogService.recordAudit("USER_UPDATED", "User", testUser.getId(), "UPDATE", null, null, "Changed name", "corr-1", null);

        var logs = auditLogRepository.findAll();
        assertThat(logs).hasSize(1);
        AuditLog log = logs.get(0);

        Exception updateEx = assertThrows(Exception.class, () -> {
            jdbcTemplate.execute("UPDATE audit_logs SET action = 'DELETE' WHERE id = '" + log.getId() + "'");
        });
        assertThat(updateEx.getMessage()).contains("Audit logs are append-only");

        Exception deleteEx = assertThrows(Exception.class, () -> {
            jdbcTemplate.execute("DELETE FROM audit_logs WHERE id = '" + log.getId() + "'");
        });
        assertThat(deleteEx.getMessage()).contains("Audit logs are append-only");
    }

    @Test
    void testSystemAdminHasNewPermissions() {
        Integer count = jdbcTemplate.queryForObject(
            "SELECT count(*) FROM role_permissions rp JOIN roles r ON rp.role_id = r.id JOIN permissions p ON rp.permission_id = p.id WHERE r.code = 'SYSTEM_ADMIN' AND p.code IN ('NOTIFICATION_READ', 'NOTIFICATION_MANAGE_PREFERENCES', 'AUDIT_LOG_READ')",
            Integer.class
        );
        assertThat(count).isEqualTo(3);
    }
}
