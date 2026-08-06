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

    public ProjectChangeRequestService(ProjectChangeRequestRepository changeRepository, UserRepository userRepository, ProjectExecutionSecurityHelper securityHelper) {
        this.changeRepository = changeRepository;
        this.userRepository = userRepository;
        this.securityHelper = securityHelper;
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
        
        return mapToDTO(changeRepository.save(cr));
    }
    
    @Transactional
    public ProjectChangeRequestDTO reviewChangeRequest(UUID id, String status, String comment, UUID userId, Collection<? extends GrantedAuthority> authorities) {
        ProjectChangeRequest cr = changeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Change request not found"));
        securityHelper.getWorkspaceAndVerifyWriteAccess(cr.getWorkspace().getId(), userId, authorities);
        
        User reviewer = userRepository.findById(userId).orElseThrow();
        cr.setReviewedBy(reviewer);
        cr.setReviewedDate(OffsetDateTime.now());
        cr.setDecisionComment(status + ": " + comment);
        cr.setStatus(com.knoweb.salesmanagement.projectexecution.enums.ChangeRequestStatus.valueOf(status));
        
        return mapToDTO(changeRepository.save(cr));
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
