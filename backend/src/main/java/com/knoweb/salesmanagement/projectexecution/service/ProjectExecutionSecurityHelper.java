package com.knoweb.salesmanagement.projectexecution.service;

import com.knoweb.salesmanagement.projectexecution.entity.ProjectExecutionWorkspace;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectExecutionWorkspaceRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.UUID;

@Component
public class ProjectExecutionSecurityHelper {
    
    private final ProjectExecutionWorkspaceRepository workspaceRepository;
    
    public ProjectExecutionSecurityHelper(ProjectExecutionWorkspaceRepository workspaceRepository) {
        this.workspaceRepository = workspaceRepository;
    }
    
    public ProjectExecutionWorkspace getWorkspaceAndVerifyWriteAccess(UUID workspaceId, UUID userId, Collection<? extends GrantedAuthority> authorities) {
        ProjectExecutionWorkspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
                
        boolean isSystemAdmin = authorities.stream().anyMatch(a -> a.getAuthority().equals("SYSTEM_ADMIN"));
        if (isSystemAdmin) {
            return workspace; // Admin bypass
        }
        
        boolean isProjectManager = workspace.getProjectManager() != null && workspace.getProjectManager().getId().equals(userId);
        
        // Wait, what if they are an employee submitting their own daily progress? 
        // This method is for generic workspace write access (PM).
        // Individual services (like daily progress, labour) will have separate checks for employee-specific writes.
        if (!isProjectManager) {
            throw new AccessDeniedException("User is not the assigned Project Manager for this workspace");
        }
        
        return workspace;
    }
}
