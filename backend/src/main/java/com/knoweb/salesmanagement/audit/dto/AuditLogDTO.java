package com.knoweb.salesmanagement.audit.dto;

import com.fasterxml.jackson.annotation.JsonRawValue;
import java.time.OffsetDateTime;
import java.util.UUID;

public class AuditLogDTO {
    private UUID id;
    private String eventType;
    private UUID actorUserId;
    private String actorNameSnapshot;
    private String entityType;
    private UUID entityId;
    private String action;
    @JsonRawValue
    private String previousState;
    @JsonRawValue
    private String newState;
    private String comments;
    private OffsetDateTime occurredAt;
    private String correlationId;
    private String requestPath;
    @JsonRawValue
    private String metadata;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public UUID getActorUserId() { return actorUserId; }
    public void setActorUserId(UUID actorUserId) { this.actorUserId = actorUserId; }

    public String getActorNameSnapshot() { return actorNameSnapshot; }
    public void setActorNameSnapshot(String actorNameSnapshot) { this.actorNameSnapshot = actorNameSnapshot; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public UUID getEntityId() { return entityId; }
    public void setEntityId(UUID entityId) { this.entityId = entityId; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getPreviousState() { return previousState; }
    public void setPreviousState(String previousState) { this.previousState = previousState; }

    public String getNewState() { return newState; }
    public void setNewState(String newState) { this.newState = newState; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public OffsetDateTime getOccurredAt() { return occurredAt; }
    public void setOccurredAt(OffsetDateTime occurredAt) { this.occurredAt = occurredAt; }

    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }

    public String getRequestPath() { return requestPath; }
    public void setRequestPath(String requestPath) { this.requestPath = requestPath; }

    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }
}
