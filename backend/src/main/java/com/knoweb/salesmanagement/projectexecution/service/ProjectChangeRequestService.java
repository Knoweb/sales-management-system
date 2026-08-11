package com.knoweb.salesmanagement.projectexecution.service;

import com.knoweb.salesmanagement.projectexecution.dto.ProjectChangeRequestDTO;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectExecutionWorkspace;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectChangeRequest;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectChangeRequestRepository;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.ApplicationEventPublisher;
import com.knoweb.salesmanagement.audit.dto.InternalAuditLogEvent;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProjectChangeRequestService {

    private final ProjectChangeRequestRepository changeRepository;
    private final UserRepository userRepository;
    private final ProjectExecutionSecurityHelper securityHelper;
    private final ApplicationEventPublisher eventPublisher;

    public ProjectChangeRequestService(ProjectChangeRequestRepository changeRepository, UserRepository userRepository, ProjectExecutionSecurityHelper securityHelper, ApplicationEventPublisher eventPublisher) {
        this.changeRepository = changeRepository;
        this.userRepository = userRepository;
        this.securityHelper = securityHelper;
        this.eventPublisher = eventPublisher;
    }

    @Transactional(readOnly = true)
    public List<ProjectChangeRequestDTO> getChangeRequestsByWorkspace(UUID workspaceId) {
        return changeRepository.findAll().stream()
                .filter(c -> c.getWorkspace().getId().equals(workspaceId))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectChangeRequestDTO createChangeRequest(ProjectChangeRequestDTO dto, UUID userId, Collection<? extends GrantedAuthority> authorities) {
        ProjectExecutionWorkspace workspace = securityHelper.getWorkspaceAndVerifyWriteAccess(dto.getWorkspaceId(), userId, authorities);

        ProjectChangeRequest cr = new ProjectChangeRequest();
        cr.setWorkspace(workspace);
        cr.setTitle(dto.getTitle());
        cr.setDescription(dto.getDescription());
        cr.setReason(dto.getReason());
        cr.setImpactDescription(dto.getImpactDescription());
        cr.setEstimatedCostImpact(dto.getEstimatedCostImpact());
        cr.setEstimatedScheduleImpactDays(dto.getEstimatedScheduleImpactDays());
        
        cr.setRequestedBy(userId);
        cr.setCreatedAt(OffsetDateTime.now());
        cr.setSubmittedDate(OffsetDateTime.now());
        cr.setStatus(com.knoweb.salesmanagement.projectexecution.enums.ChangeRequestStatus.SUBMITTED); // simplified
        
        ProjectChangeRequestDTO resultDto = mapToDTO(changeRepository.save(cr));

        InternalAuditLogEvent auditEvent = new InternalAuditLogEvent();
        auditEvent.setEventType("PROJECT_CHANGE_REQUEST_CREATED");
        auditEvent.setEntityType("ProjectChangeRequest");
        auditEvent.setEntityId(cr.getId());
        auditEvent.setAction("CREATE");
        auditEvent.setNewState(resultDto);
        eventPublisher.publishEvent(auditEvent);

        if (cr.getWorkspace().getProjectManager() != null && cr.getWorkspace().getProjectManager().getUser() != null) {
            try {
                com.knoweb.salesmanagement.notification.dto.InternalNotificationEvent notif = new com.knoweb.salesmanagement.notification.dto.InternalNotificationEvent();
                notif.setEventType("PROJECT_CHANGE_REQUEST_CREATED");
                notif.setTitle("Change Request Submitted");
                notif.setMessage("A new change request has been submitted: " + cr.getTitle());
                notif.setEntityType("PROJECT_CHANGE_REQUEST");
                notif.setEntityId(cr.getId());
                notif.setContextUrl("/execution-workspaces/" + cr.getWorkspace().getId() + "/changes");
                notif.setDeduplicationKey("cr_created_" + cr.getId());
                notif.setRecipientUserIds(java.util.Set.of(cr.getWorkspace().getProjectManager().getUser().getId()));
                eventPublisher.publishEvent(notif);
            } catch (Exception e) {
                System.err.println("Failed to send CR created notification: " + e.getMessage());
            }
        }

        return resultDto;
    }
    
    @Transactional
    public ProjectChangeRequestDTO reviewChangeRequest(UUID id, String status, String comment, UUID userId, Collection<? extends GrantedAuthority> authorities) {
        ProjectChangeRequest cr = changeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Change request not found"));
        securityHelper.getWorkspaceAndVerifyWriteAccess(cr.getWorkspace().getId(), userId, authorities);
        
        ProjectChangeRequestDTO previousDto = mapToDTO(cr);
        
        User reviewer = userRepository.findById(userId).orElseThrow();
        cr.setReviewedBy(reviewer);
        cr.setReviewedDate(OffsetDateTime.now());
        cr.setDecisionComment(status + ": " + comment);
        cr.setStatus(com.knoweb.salesmanagement.projectexecution.enums.ChangeRequestStatus.valueOf(status));
        
        ProjectChangeRequestDTO resultDto = mapToDTO(changeRepository.save(cr));

        InternalAuditLogEvent auditEvent = new InternalAuditLogEvent();
        auditEvent.setEventType("PROJECT_CHANGE_REQUEST_REVIEWED");
        auditEvent.setEntityType("ProjectChangeRequest");
        auditEvent.setEntityId(cr.getId());
        auditEvent.setAction("REVIEW");
        auditEvent.setPreviousState(previousDto);
        auditEvent.setNewState(resultDto);
        eventPublisher.publishEvent(auditEvent);

        if (cr.getRequestedBy() != null) {
            try {
                com.knoweb.salesmanagement.notification.dto.InternalNotificationEvent notif = new com.knoweb.salesmanagement.notification.dto.InternalNotificationEvent();
                notif.setEventType("PROJECT_CHANGE_REQUEST_REVIEWED");
                notif.setTitle("Change Request Reviewed: " + status);
                notif.setMessage("A decision has been made on your change request: " + cr.getTitle());
                notif.setEntityType("PROJECT_CHANGE_REQUEST");
                notif.setEntityId(cr.getId());
                notif.setContextUrl("/execution-workspaces/" + cr.getWorkspace().getId() + "/changes");
                notif.setDeduplicationKey("cr_reviewed_" + cr.getId());
                notif.setRecipientUserIds(java.util.Set.of(cr.getRequestedBy()));
                eventPublisher.publishEvent(notif);
            } catch (Exception e) {
                System.err.println("Failed to send CR reviewed notification: " + e.getMessage());
            }
        }

        return resultDto;
    }

    private ProjectChangeRequestDTO mapToDTO(ProjectChangeRequest cr) {
        ProjectChangeRequestDTO dto = new ProjectChangeRequestDTO();
        dto.setId(cr.getId());
        dto.setWorkspaceId(cr.getWorkspace().getId());
        dto.setTitle(cr.getTitle());
        dto.setDescription(cr.getDescription());
        dto.setReason(cr.getReason());
        dto.setImpactDescription(cr.getImpactDescription());
        dto.setEstimatedCostImpact(cr.getEstimatedCostImpact());
        dto.setEstimatedScheduleImpactDays(cr.getEstimatedScheduleImpactDays());
        dto.setRequestedBy(cr.getRequestedBy());
        if (cr.getReviewedBy() != null) {
            dto.setReviewedById(cr.getReviewedBy().getId());
            dto.setReviewedByName(cr.getReviewedBy().getFirstName() + " " + cr.getReviewedBy().getLastName());
        }
        dto.setSubmittedDate(cr.getSubmittedDate());
        dto.setReviewedDate(cr.getReviewedDate());
        dto.setDecisionComment(cr.getDecisionComment());
        dto.setCreatedAt(cr.getCreatedAt());
        
        if (cr.getReviewedDate() != null) {
            dto.setStatus(cr.getDecisionComment() != null && cr.getDecisionComment().startsWith("APPROVED") ? "APPROVED" : "REJECTED");
        } else {
            dto.setStatus("PENDING");
        }
        return dto;
    }
}
