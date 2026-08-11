package com.knoweb.salesmanagement.audit.service;

import com.knoweb.salesmanagement.audit.dto.InternalAuditLogEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class AuditLogEventListener {

    private static final Logger log = LoggerFactory.getLogger(AuditLogEventListener.class);
    private final AuditLogService auditLogService;

    public AuditLogEventListener(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @Async
    @EventListener
    public void handleAuditLogEvent(InternalAuditLogEvent event) {
        log.debug("Received audit log event: {} for {} {}", event.getAction(), event.getEntityType(), event.getEntityId());
        try {
            auditLogService.recordAudit(
                event.getEventType(),
                event.getEntityType(),
                event.getEntityId(),
                event.getAction(),
                event.getPreviousState(),
                event.getNewState(),
                event.getComments(),
                event.getCorrelationId(),
                event.getMetadata()
            );
        } catch (Exception e) {
            log.error("Failed to process audit log event", e);
        }
    }
}
