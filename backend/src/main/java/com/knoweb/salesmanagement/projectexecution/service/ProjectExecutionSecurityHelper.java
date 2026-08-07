package com.knoweb.salesmanagement.projectexecution.service;

import com.knoweb.salesmanagement.employee.entity.Employee;
import com.knoweb.salesmanagement.employee.repository.EmployeeRepository;
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
    private final EmployeeRepository employeeRepository;
    
    public ProjectExecutionSecurityHelper(ProjectExecutionWorkspaceRepository workspaceRepository, EmployeeRepository employeeRepository) {
        this.workspaceRepository = workspaceRepository;
        this.employeeRepository = employeeRepository;
    }
    
    public ProjectExecutionWorkspace getWorkspaceAndVerifyWriteAccess(UUID workspaceId, UUID userId, Collection<? extends GrantedAuthority> authorities) {
        ProjectExecutionWorkspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
                
        boolean isSystemAdmin = authorities.stream().anyMatch(a -> a.getAuthority().equals("SYSTEM_ADMIN"));
        if (isSystemAdmin) {
            return workspace; // Admin bypass
        }
        
        boolean hasWriteAuthority = authorities.stream().anyMatch(a -> a.getAuthority().equals("PROJECT_EXECUTION_WRITE"));
        if (!hasWriteAuthority) {
            throw new AccessDeniedException("User does not have write permission for project execution");
        }
        
        boolean isProjectManager = false;
        if (workspace.getProjectManager() != null) {
            Employee employee = employeeRepository.findByUserId(userId).orElse(null);
            if (employee != null) {
                isProjectManager = workspace.getProjectManager().getId().equals(employee.getId());
            }
        }
        
        // Wait, what if they are an employee submitting their own daily progress? 
        // This method is for generic workspace write access (PM).
        // Individual services (like daily progress, labour) will have separate checks for employee-specific writes.
        if (!isProjectManager) {
            throw new AccessDeniedException("User is not the assigned Project Manager for this workspace");
        }
        
        return workspace;
    }
}
