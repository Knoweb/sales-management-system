package com.knoweb.salesmanagement.projectexecution.service;

import com.knoweb.salesmanagement.projectexecution.dto.ProjectIssueDTO;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectExecutionWorkspace;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectIssue;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectTask;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectIssueRepository;
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
public class ProjectIssueService {

    private final ProjectIssueRepository issueRepository;
    private final ProjectTaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectExecutionSecurityHelper securityHelper;

    public ProjectIssueService(ProjectIssueRepository issueRepository, ProjectTaskRepository taskRepository, UserRepository userRepository, ProjectExecutionSecurityHelper securityHelper) {
        this.issueRepository = issueRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.securityHelper = securityHelper;
    }

    @Transactional(readOnly = true)
    public List<ProjectIssueDTO> getIssuesByWorkspace(UUID workspaceId) {
        return issueRepository.findAll().stream()
                .filter(i -> i.getWorkspace().getId().equals(workspaceId))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectIssueDTO reportIssue(ProjectIssueDTO dto, UUID userId, Collection<? extends GrantedAuthority> authorities) {
        ProjectExecutionWorkspace workspace = securityHelper.getWorkspaceAndVerifyWriteAccess(dto.getWorkspaceId(), userId, authorities);

        ProjectIssue issue = new ProjectIssue();
        issue.setWorkspace(workspace);
        
        if (dto.getTaskId() != null) {
            ProjectTask task = taskRepository.findById(dto.getTaskId())
                    .orElseThrow(() -> new RuntimeException("Task not found"));
            issue.setTask(task);
        }
        
        issue.setTitle(dto.getTitle());
        issue.setDescription(dto.getDescription());
        issue.setSeverity(com.knoweb.salesmanagement.projectexecution.enums.IssueSeverity.valueOf(dto.getSeverity()));
        issue.setStatus(com.knoweb.salesmanagement.projectexecution.enums.IssueStatus.OPEN);
        issue.setReportedBy(userId);
        issue.setReportedDate(OffsetDateTime.now());
        
        if (dto.getOwnerId() != null) {
            User owner = userRepository.findById(dto.getOwnerId())
                    .orElseThrow(() -> new RuntimeException("Owner not found"));
            issue.setOwner(owner);
        }
        
        return mapToDTO(issueRepository.save(issue));
    }
    
    @Transactional
    public ProjectIssueDTO updateIssueStatus(UUID issueId, String status, String resolutionNote, UUID userId, Collection<? extends GrantedAuthority> authorities) {
        ProjectIssue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));
                
        securityHelper.getWorkspaceAndVerifyWriteAccess(issue.getWorkspace().getId(), userId, authorities);
        
        issue.setStatus(com.knoweb.salesmanagement.projectexecution.enums.IssueStatus.valueOf(status));
        if (resolutionNote != null && !resolutionNote.isBlank()) {
            issue.setResolutionNote(resolutionNote);
        }
        
        if ("RESOLVED".equals(status) || "CLOSED".equals(status)) {
            issue.setResolvedDate(OffsetDateTime.now());
        }
        
        return mapToDTO(issueRepository.save(issue));
    }

    private ProjectIssueDTO mapToDTO(ProjectIssue issue) {
        ProjectIssueDTO dto = new ProjectIssueDTO();
        dto.setId(issue.getId());
        dto.setWorkspaceId(issue.getWorkspace().getId());
        if (issue.getTask() != null) {
            dto.setTaskId(issue.getTask().getId());
            dto.setTaskTitle(issue.getTask().getTitle());
        }
        dto.setTitle(issue.getTitle());
        dto.setDescription(issue.getDescription());
        dto.setSeverity(issue.getSeverity() != null ? issue.getSeverity().name() : null);
        dto.setStatus(issue.getStatus() != null ? issue.getStatus().name() : null);
        dto.setResolutionNote(issue.getResolutionNote());
        dto.setReportedBy(issue.getReportedBy());
        dto.setReportedDate(issue.getReportedDate());
        dto.setResolvedDate(issue.getResolvedDate());
        if (issue.getOwner() != null) {
            dto.setOwnerId(issue.getOwner().getId());
            dto.setOwnerName(issue.getOwner().getFirstName() + " " + issue.getOwner().getLastName());
        }
        return dto;
    }
}
