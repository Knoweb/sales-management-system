package com.knoweb.salesmanagement.projectexecution.service;

import com.knoweb.salesmanagement.department.repository.DepartmentRepository;
import com.knoweb.salesmanagement.projectexecution.dto.ProjectEmployeeAllocationDTO;
import com.knoweb.salesmanagement.projectexecution.dto.ProjectLabourEntryDTO;
import com.knoweb.salesmanagement.projectexecution.dto.ProjectMaterialUsageDTO;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectEmployeeAllocation;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectExecutionWorkspace;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectLabourEntry;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectMaterialUsage;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectEmployeeAllocationRepository;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectExecutionWorkspaceRepository;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectLabourEntryRepository;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectMaterialUsageRepository;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectTaskRepository;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.GrantedAuthority;
import java.util.Collection;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProjectResourceService {

    private final ProjectEmployeeAllocationRepository allocationRepository;
    private final ProjectLabourEntryRepository labourEntryRepository;
    private final ProjectMaterialUsageRepository materialUsageRepository;
    private final ProjectExecutionWorkspaceRepository workspaceRepository;
    private final ProjectTaskRepository taskRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final ProjectExecutionSecurityHelper securityHelper;

    public ProjectResourceService(ProjectEmployeeAllocationRepository allocationRepository, ProjectLabourEntryRepository labourEntryRepository, ProjectMaterialUsageRepository materialUsageRepository, ProjectExecutionWorkspaceRepository workspaceRepository, ProjectTaskRepository taskRepository, UserRepository userRepository, DepartmentRepository departmentRepository, ProjectExecutionSecurityHelper securityHelper) {
        this.allocationRepository = allocationRepository;
        this.labourEntryRepository = labourEntryRepository;
        this.materialUsageRepository = materialUsageRepository;
        this.workspaceRepository = workspaceRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.securityHelper = securityHelper;
    }


    public List<ProjectEmployeeAllocationDTO> getAllocationsByWorkspaceId(UUID workspaceId) {
        return allocationRepository.findByWorkspaceId(workspaceId).stream().map(a -> {
            ProjectEmployeeAllocationDTO dto = new ProjectEmployeeAllocationDTO();
            dto.setId(a.getId());
            dto.setWorkspaceId(a.getWorkspace().getId());
            dto.setEmployeeId(a.getEmployee().getId());
            dto.setEmployeeName(a.getEmployee().getFirstName() + " " + a.getEmployee().getLastName());
            dto.setDepartmentId(a.getDepartment().getId());
            dto.setDepartmentName(a.getDepartment().getName());
            dto.setRoleDescription(a.getRoleDescription());
            dto.setAllocationPercentage(a.getAllocationPercentage());
            dto.setAllocatedHours(a.getAllocatedHours());
            dto.setAllocationStartDate(a.getAllocationStartDate());
            dto.setAllocationEndDate(a.getAllocationEndDate());
            dto.setIsActive(a.getIsActive());
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void allocateEmployee(ProjectEmployeeAllocationDTO dto, UUID allocatedBy, Collection<? extends GrantedAuthority> authorities) {
        securityHelper.getWorkspaceAndVerifyWriteAccess(dto.getWorkspaceId(), allocatedBy, authorities);
        ProjectExecutionWorkspace workspace = workspaceRepository.findById(dto.getWorkspaceId()).orElseThrow();
        ProjectEmployeeAllocation allocation = new ProjectEmployeeAllocation();
        allocation.setWorkspace(workspace);
        allocation.setEmployee(userRepository.findById(dto.getEmployeeId()).orElseThrow());
        allocation.setDepartment(departmentRepository.findById(dto.getDepartmentId()).orElseThrow());
        allocation.setRoleDescription(dto.getRoleDescription());
        allocation.setAllocationPercentage(dto.getAllocationPercentage());
        allocation.setAllocatedHours(dto.getAllocatedHours());
        allocation.setAllocationStartDate(dto.getAllocationStartDate());
        allocation.setAllocationEndDate(dto.getAllocationEndDate());
        allocation.setAllocatedBy(allocatedBy);
        allocationRepository.save(allocation);
    }
    
    // Similarly implement labour and materials...

    @Transactional
    public void deactivateAllocation(UUID allocationId, UUID deactivatedBy, Collection<? extends GrantedAuthority> authorities) {
        ProjectEmployeeAllocation allocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new RuntimeException("Allocation not found"));
        securityHelper.getWorkspaceAndVerifyWriteAccess(allocation.getWorkspace().getId(), deactivatedBy, authorities);
                
        boolean isSystemAdmin = authorities.stream().anyMatch(a -> a.getAuthority().equals("SYSTEM_ADMIN"));
        boolean isProjectManager = allocation.getWorkspace().getProjectManager() != null && allocation.getWorkspace().getProjectManager().getId().equals(deactivatedBy);
        if (!isSystemAdmin && !isProjectManager) {
            throw new org.springframework.security.access.AccessDeniedException("Cannot deactivate allocation");
        }
        
        allocation.setIsActive(false);
        allocation.setUpdatedAt(java.time.OffsetDateTime.now());
        allocationRepository.save(allocation);
    }
}
