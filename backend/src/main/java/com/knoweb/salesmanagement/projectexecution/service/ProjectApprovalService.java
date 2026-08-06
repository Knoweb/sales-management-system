package com.knoweb.salesmanagement.projectexecution.service;

import com.knoweb.salesmanagement.projectexecution.dto.ProjectApprovalRequestDTO;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectExecutionWorkspace;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectApprovalRequest;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectTask;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectApprovalRequestRepository;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectTaskRepository;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProjectApprovalService {

    private final ProjectApprovalRequestRepository approvalRepository;
    private final ProjectTaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectExecutionSecurityHelper securityHelper;

    public ProjectApprovalService(ProjectApprovalRequestRepository approvalRepository, ProjectTaskRepository taskRepository, UserRepository userRepository, ProjectExecutionSecurityHelper securityHelper) {
        this.approvalRepository = approvalRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.securityHelper = securityHelper;
    }

    @Transactional(readOnly = true)
    public List<ProjectApprovalRequestDTO> getApprovalsByWorkspace(UUID workspaceId) {
        return approvalRepository.findAll().stream()
                .filter(a -> a.getWorkspace().getId().equals(workspaceId))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectApprovalRequestDTO requestApproval(ProjectApprovalRequestDTO dto, UUID userId, Collection<? extends GrantedAuthority> authorities) {
        ProjectExecutionWorkspace workspace = securityHelper.getWorkspaceAndVerifyWriteAccess(dto.getWorkspaceId(), userId, authorities);

        ProjectApprovalRequest approval = new ProjectApprovalRequest();
        approval.setWorkspace(workspace);
        
        if (dto.getTaskId() != null) {
            ProjectTask task = taskRepository.findById(dto.getTaskId())
                    .orElseThrow(() -> new RuntimeException("Task not found"));
            approval.setTask(task);
        }
        
        approval.setApprovalType(dto.getApprovalType());
        approval.setTitle(dto.getTitle());
        approval.setDescription(dto.getDescription());
        approval.setRequestedBy(userId);
        approval.setCreatedAt(OffsetDateTime.now());
        
        if (dto.getAssignedApproverId() != null) {
            User approver = userRepository.findById(dto.getAssignedApproverId())
                    .orElseThrow(() -> new RuntimeException("Approver not found"));
            approval.setAssignedApprover(approver);
        }
        
        // Hardcode a status field on DTO since we didn't add it explicitly to entity, 
        // Or we use submissionDate/decisionDate to infer status
        approval.setSubmittedDate(OffsetDateTime.now());
        approval.setStatus(com.knoweb.salesmanagement.projectexecution.enums.ApprovalRequestStatus.SUBMITTED);
        
        return mapToDTO(approvalRepository.save(approval));
    }
    
    @Transactional
    public ProjectApprovalRequestDTO updateDecision(UUID id, String status, String comment, UUID userId, Collection<? extends GrantedAuthority> authorities) {
        ProjectApprovalRequest approval = approvalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Approval request not found"));
        // Assuming the assigned approver or SYSTEM_ADMIN can approve
        // For now just check general write access
        securityHelper.getWorkspaceAndVerifyWriteAccess(approval.getWorkspace().getId(), userId, authorities);
        
        approval.setDecisionDate(OffsetDateTime.now());
        approval.setDecisionComment(status + ": " + comment);
        approval.setStatus(com.knoweb.salesmanagement.projectexecution.enums.ApprovalRequestStatus.valueOf(status));
        
        return mapToDTO(approvalRepository.save(approval));
    }

    private ProjectApprovalRequestDTO mapToDTO(ProjectApprovalRequest approval) {
        ProjectApprovalRequestDTO dto = new ProjectApprovalRequestDTO();
        dto.setId(approval.getId());
        dto.setWorkspaceId(approval.getWorkspace().getId());
        if (approval.getTask() != null) {
            dto.setTaskId(approval.getTask().getId());
            dto.setTaskTitle(approval.getTask().getTitle());
        }
        dto.setApprovalType(approval.getApprovalType());
        dto.setTitle(approval.getTitle());
        dto.setDescription(approval.getDescription());
        dto.setRequestedBy(approval.getRequestedBy());
        if (approval.getAssignedApprover() != null) {
            dto.setAssignedApproverId(approval.getAssignedApprover().getId());
            dto.setAssignedApproverName(approval.getAssignedApprover().getFirstName() + " " + approval.getAssignedApprover().getLastName());
        }
        dto.setSubmittedDate(approval.getSubmittedDate());
        dto.setDecisionDate(approval.getDecisionDate());
        dto.setDecisionComment(approval.getDecisionComment());
        dto.setCreatedAt(approval.getCreatedAt());
        
        dto.setStatus(approval.getStatus() != null ? approval.getStatus().name() : null);
        return dto;
    }
}
