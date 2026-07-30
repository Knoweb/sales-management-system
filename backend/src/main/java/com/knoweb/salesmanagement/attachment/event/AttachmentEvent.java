package com.knoweb.salesmanagement.attachment.event;

import org.springframework.context.ApplicationEvent;

import java.util.UUID;

public class AttachmentEvent extends ApplicationEvent {
    
    private final UUID entityId;
    private final String entityType;
    private final String action; // e.g. "UPLOADED", "REMOVED"
    private final String fileName;

    public AttachmentEvent(Object source, UUID entityId, String entityType, String action, String fileName) {
        super(source);
        this.entityId = entityId;
        this.entityType = entityType;
        this.action = action;
        this.fileName = fileName;
    }

    public UUID getEntityId() { return entityId; }
    public String getEntityType() { return entityType; }
    public String getAction() { return action; }
    public String getFileName() { return fileName; }
}
