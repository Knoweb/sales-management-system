package com.knoweb.salesmanagement.audit.service;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ObjectNode;
import com.knoweb.salesmanagement.audit.entity.AuditLog;
import com.knoweb.salesmanagement.audit.repository.AuditLogRepository;
import com.knoweb.salesmanagement.security.principal.CustomUserDetails;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final JsonMapper jsonMapper;

    private static final Set<String> SENSITIVE_FIELDS = Set.of(
        "password", "passwordHash", "jwt", "token", "refreshToken", "verificationToken", "encryptionKey", "encryptedToken"
    );

    public AuditLogService(AuditLogRepository auditLogRepository, UserRepository userRepository, JsonMapper jsonMapper) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
        this.jsonMapper = jsonMapper;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordAudit(String eventType, String entityType, UUID entityId, String action, 
                            Object previousStateObj, Object newStateObj, String comments, 
                            String correlationId, Object metadataObj) {
        
        JsonNode previousStateNode = sanitizeState(previousStateObj);
        JsonNode newStateNode = sanitizeState(newStateObj);
        JsonNode metadata = sanitizeState(metadataObj);

        AuditLog log = new AuditLog();
        log.setEventType(eventType);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setAction(action);
        log.setPreviousState(previousStateNode != null ? previousStateNode.toString() : null);
        log.setNewState(newStateNode != null ? newStateNode.toString() : null);
        log.setComments(comments);
        log.setOccurredAt(OffsetDateTime.now());
        log.setCorrelationId(correlationId);
        log.setRequestPath(metadata != null && metadata.has("requestPath") ? metadata.get("requestPath").asText() : null);
        log.setMetadata(metadata != null ? metadata.toString() : null);
        
        // Resolve Actor
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof CustomUserDetails) {
            CustomUserDetails details = (CustomUserDetails) auth.getPrincipal();
            log.setActorUserId(details.getId());
            User user = userRepository.findById(details.getId()).orElse(null);
            log.setActorNameSnapshot(user != null ? user.getFirstName() + " " + user.getLastName() : details.getUsername());
        } else {
            log.setActorNameSnapshot("SYSTEM");
        }

        // Resolve Request Path
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs != null) {
            HttpServletRequest req = attrs.getRequest();
            log.setRequestPath(req.getRequestURI());
        }

        auditLogRepository.save(log);
    }

    private JsonNode sanitizeState(Object stateObj) {
        if (stateObj == null) return null;
        
        JsonNode node = jsonMapper.valueToTree(stateObj);
        sanitizeNode(node);
        return node;
    }

    private void sanitizeNode(JsonNode node) {
        if (node.isObject()) {
            ObjectNode objectNode = (ObjectNode) node;
            SENSITIVE_FIELDS.forEach(objectNode::remove);
            objectNode.properties().forEach(entry -> sanitizeNode(entry.getValue()));
        } else if (node.isArray()) {
            node.forEach(this::sanitizeNode);
        }
    }
}
