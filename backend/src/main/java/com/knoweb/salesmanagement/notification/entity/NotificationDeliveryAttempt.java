package com.knoweb.salesmanagement.notification.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "notification_delivery_attempts")
public class NotificationDeliveryAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notification_id", nullable = false)
    private Notification notification;

    @Column(nullable = false, length = 50)
    private String channel;

    @Column(name = "attempt_number", nullable = false)
    private int attemptNumber = 1;

    @Column(nullable = false, length = 50)
    private String status;

    @CreationTimestamp
    @Column(name = "attempted_at", nullable = false, updatable = false)
    private OffsetDateTime attemptedAt;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    public NotificationDeliveryAttempt() {
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Notification getNotification() { return notification; }
    public void setNotification(Notification notification) { this.notification = notification; }

    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }

    public int getAttemptNumber() { return attemptNumber; }
    public void setAttemptNumber(int attemptNumber) { this.attemptNumber = attemptNumber; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public OffsetDateTime getAttemptedAt() { return attemptedAt; }
    public void setAttemptedAt(OffsetDateTime attemptedAt) { this.attemptedAt = attemptedAt; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}
