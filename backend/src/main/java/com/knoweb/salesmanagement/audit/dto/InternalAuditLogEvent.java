package com.knoweb.salesmanagement.audit.dto;

import java.util.UUID;

public class InternalAuditLogEvent {
    private String eventType;
    private String entityType;
    private UUID entityId;
    private String action;
    private Object previousState;
    private Object newState;
    private String comments;
    private String correlationId;
    private Object metadata;

    public InternalAuditLogEvent() {}

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public UUID getEntityId() { return entityId; }
    public void setEntityId(UUID entityId) { this.entityId = entityId; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public Object getPreviousState() { return previousState; }
    public void setPreviousState(Object previousState) { this.previousState = previousState; }

    public Object getNewState() { return newState; }
    public void setNewState(Object newState) { this.newState = newState; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }

    public Object getMetadata() { return metadata; }
    public void setMetadata(Object metadata) { this.metadata = metadata; }
}
