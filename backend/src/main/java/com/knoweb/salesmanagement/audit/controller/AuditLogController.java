package com.knoweb.salesmanagement.audit.controller;

import com.knoweb.salesmanagement.audit.dto.AuditLogDTO;
import com.knoweb.salesmanagement.audit.entity.AuditLog;
import com.knoweb.salesmanagement.audit.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.criteria.Predicate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/audit-logs")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    public AuditLogController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('AUDIT_LOG_READ')")
    public Page<AuditLogDTO> getAuditLogs(
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) UUID entityId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) UUID actorUserId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime dateTo,
            @PageableDefault(sort = "occurredAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        Specification<AuditLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (entityType != null) {
                predicates.add(cb.equal(root.get("entityType"), entityType));
            }
            if (entityId != null) {
                predicates.add(cb.equal(root.get("entityId"), entityId));
            }
            if (action != null) {
                predicates.add(cb.equal(root.get("action"), action));
            }
            if (actorUserId != null) {
                predicates.add(cb.equal(root.get("actorUserId"), actorUserId));
            }
            if (dateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("occurredAt"), dateFrom));
            }
            if (dateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("occurredAt"), dateTo));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return auditLogRepository.findAll(spec, pageable).map(this::mapToDTO);
    }

    private AuditLogDTO mapToDTO(AuditLog entity) {
        AuditLogDTO dto = new AuditLogDTO();
        dto.setId(entity.getId());
        dto.setEventType(entity.getEventType());
        dto.setActorUserId(entity.getActorUserId());
        dto.setActorNameSnapshot(entity.getActorNameSnapshot());
        dto.setEntityType(entity.getEntityType());
        dto.setEntityId(entity.getEntityId());
        dto.setAction(entity.getAction());
        dto.setPreviousState(entity.getPreviousState());
        dto.setNewState(entity.getNewState());
        dto.setComments(entity.getComments());
        dto.setOccurredAt(entity.getOccurredAt());
        dto.setCorrelationId(entity.getCorrelationId());
        dto.setRequestPath(entity.getRequestPath());
        dto.setMetadata(entity.getMetadata());
        return dto;
    }
}
