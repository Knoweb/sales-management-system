package com.knoweb.salesmanagement.notification.dto;

import tools.jackson.databind.JsonNode;
import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

public class InternalNotificationEvent {
    private UUID eventId;
    private String eventType;
    private OffsetDateTime occurredAt;
    private UUID actorUserId;
    private String actorName;
    private String entityType;
    private UUID entityId;
    private Set<UUID> recipientUserIds;
    private String title;
    private String message;
    private String contextUrl;
    private String deduplicationKey;
    private String correlationId;
    private JsonNode metadata;

    public InternalNotificationEvent() {
        this.eventId = UUID.randomUUID();
        this.occurredAt = OffsetDateTime.now();
    }

    public UUID getEventId() { return eventId; }
    public void setEventId(UUID eventId) { this.eventId = eventId; }
    
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    
    public OffsetDateTime getOccurredAt() { return occurredAt; }
    public void setOccurredAt(OffsetDateTime occurredAt) { this.occurredAt = occurredAt; }
    
    public UUID getActorUserId() { return actorUserId; }
    public void setActorUserId(UUID actorUserId) { this.actorUserId = actorUserId; }
    
    public String getActorName() { return actorName; }
    public void setActorName(String actorName) { this.actorName = actorName; }
    
    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    
    public UUID getEntityId() { return entityId; }
    public void setEntityId(UUID entityId) { this.entityId = entityId; }
    
    public Set<UUID> getRecipientUserIds() { return recipientUserIds; }
    public void setRecipientUserIds(Set<UUID> recipientUserIds) { this.recipientUserIds = recipientUserIds; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public String getContextUrl() { return contextUrl; }
    public void setContextUrl(String contextUrl) { this.contextUrl = contextUrl; }
    
    public String getDeduplicationKey() { return deduplicationKey; }
    public void setDeduplicationKey(String deduplicationKey) { this.deduplicationKey = deduplicationKey; }
    
    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }
    
    public JsonNode getMetadata() { return metadata; }
    public void setMetadata(JsonNode metadata) { this.metadata = metadata; }
}
