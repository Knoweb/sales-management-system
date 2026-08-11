package com.knoweb.salesmanagement.projectexecution.service;

import com.knoweb.salesmanagement.projectexecution.dto.ProjectDelayReportDTO;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectExecutionWorkspace;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectDelayReport;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectTask;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectDelayReportRepository;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectTaskRepository;
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
public class ProjectDelayService {

    private final ProjectDelayReportRepository delayRepository;
    private final ProjectTaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectExecutionSecurityHelper securityHelper;
    private final ApplicationEventPublisher eventPublisher;

    public ProjectDelayService(ProjectDelayReportRepository delayRepository, ProjectTaskRepository taskRepository, UserRepository userRepository, ProjectExecutionSecurityHelper securityHelper, ApplicationEventPublisher eventPublisher) {
        this.delayRepository = delayRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.securityHelper = securityHelper;
        this.eventPublisher = eventPublisher;
    }

    @Transactional(readOnly = true)
    public List<ProjectDelayReportDTO> getDelaysByWorkspace(UUID workspaceId) {
        return delayRepository.findAll().stream()
                .filter(d -> d.getWorkspace().getId().equals(workspaceId))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectDelayReportDTO reportDelay(ProjectDelayReportDTO dto, UUID userId, Collection<? extends GrantedAuthority> authorities) {
        ProjectExecutionWorkspace workspace = securityHelper.getWorkspaceAndVerifyWriteAccess(dto.getWorkspaceId(), userId, authorities);

        ProjectDelayReport delay = new ProjectDelayReport();
        delay.setWorkspace(workspace);
        
        if (dto.getTaskId() != null) {
            ProjectTask task = taskRepository.findById(dto.getTaskId())
                    .orElseThrow(() -> new RuntimeException("Task not found"));
            delay.setTask(task);
        }
        
        delay.setReason(dto.getReason());
        delay.setExpectedDelayDays(dto.getExpectedDelayDays());
        delay.setRevisedExpectedDate(dto.getRevisedExpectedDate());
        delay.setImpactDescription(dto.getImpactDescription());
        delay.setMitigationPlan(dto.getMitigationPlan());
        delay.setReportedBy(userId);
        delay.setCreatedAt(OffsetDateTime.now());
        delay.setStatus(com.knoweb.salesmanagement.projectexecution.enums.DelayStatus.REPORTED);
        
        // Use an unofficial status field handled by client if needed or a dedicated field in future
        ProjectDelayReportDTO resultDto = mapToDTO(delayRepository.save(delay));

        InternalAuditLogEvent auditEvent = new InternalAuditLogEvent();
        auditEvent.setEventType("PROJECT_DELAY_REPORTED");
        auditEvent.setEntityType("ProjectDelayReport");
        auditEvent.setEntityId(delay.getId());
        auditEvent.setAction("REPORT");
        auditEvent.setNewState(resultDto);
        eventPublisher.publishEvent(auditEvent);

        if (delay.getWorkspace().getProjectManager() != null && delay.getWorkspace().getProjectManager().getUser() != null) {
            try {
                com.knoweb.salesmanagement.notification.dto.InternalNotificationEvent notif = new com.knoweb.salesmanagement.notification.dto.InternalNotificationEvent();
                notif.setEventType("PROJECT_DELAY_REPORTED");
                notif.setTitle("Project Delay Reported");
                notif.setMessage("A delay was reported for task: " + (delay.getTask() != null ? delay.getTask().getTitle() : "N/A"));
                notif.setEntityType("PROJECT_DELAY");
                notif.setEntityId(delay.getId());
                notif.setContextUrl("/execution-workspaces/" + delay.getWorkspace().getId() + "/delays");
                notif.setDeduplicationKey("delay_report_" + delay.getId());
                notif.setRecipientUserIds(java.util.Set.of(delay.getWorkspace().getProjectManager().getUser().getId()));
                eventPublisher.publishEvent(notif);
            } catch (Exception e) {
                System.err.println("Failed to send delay notification: " + e.getMessage());
            }
        }

        return resultDto;
    }

    private ProjectDelayReportDTO mapToDTO(ProjectDelayReport delay) {
        ProjectDelayReportDTO dto = new ProjectDelayReportDTO();
        dto.setId(delay.getId());
        dto.setWorkspaceId(delay.getWorkspace().getId());
        if (delay.getTask() != null) {
            dto.setTaskId(delay.getTask().getId());
            dto.setTaskTitle(delay.getTask().getTitle());
        }
        dto.setReason(delay.getReason());
        dto.setExpectedDelayDays(delay.getExpectedDelayDays());
        dto.setRevisedExpectedDate(delay.getRevisedExpectedDate());
        dto.setImpactDescription(delay.getImpactDescription());
        dto.setMitigationPlan(delay.getMitigationPlan());
        dto.setReportedBy(delay.getReportedBy());
        if (delay.getReviewedBy() != null) {
            dto.setReviewedById(delay.getReviewedBy().getId());
            dto.setReviewedByName(delay.getReviewedBy().getFirstName() + " " + delay.getReviewedBy().getLastName());
        }
        dto.setCreatedAt(delay.getCreatedAt());
        // For status, delay entity might not have it in the provided dump, so we return generic.
        dto.setStatus(delay.getStatus() != null ? delay.getStatus().name() : null);
        return dto;
    }
}
