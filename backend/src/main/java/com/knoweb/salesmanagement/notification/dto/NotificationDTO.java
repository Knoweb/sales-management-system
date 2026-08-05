package com.knoweb.salesmanagement.notification.dto;

import com.fasterxml.jackson.annotation.JsonRawValue;
import java.time.OffsetDateTime;
import java.util.UUID;

public class NotificationDTO {
    private UUID id;
    private String eventType;
    private String title;
    private String message;
    private String entityType;
    private UUID entityId;
    private String contextUrl;
    private boolean read;
    private OffsetDateTime readAt;
    private OffsetDateTime createdAt;
    @JsonRawValue
    private String metadata;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    
    public UUID getEntityId() { return entityId; }
    public void setEntityId(UUID entityId) { this.entityId = entityId; }
    
    public String getContextUrl() { return contextUrl; }
    public void setContextUrl(String contextUrl) { this.contextUrl = contextUrl; }
    
    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
    
    public OffsetDateTime getReadAt() { return readAt; }
    public void setReadAt(OffsetDateTime readAt) { this.readAt = readAt; }
    
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    
    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }
}
