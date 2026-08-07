package com.knoweb.salesmanagement.projectexecution.service;

import com.knoweb.salesmanagement.projectexecution.dto.ProjectLabourEntryDTO;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectExecutionWorkspace;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectLabourEntry;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectTask;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectExecutionWorkspaceRepository;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectLabourEntryRepository;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectTaskRepository;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.GrantedAuthority;
import com.knoweb.salesmanagement.employee.repository.EmployeeRepository;
import com.knoweb.salesmanagement.employee.entity.Employee;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProjectLabourService {

    private final ProjectLabourEntryRepository labourRepository;
    private final ProjectExecutionWorkspaceRepository workspaceRepository;
    private final ProjectTaskRepository taskRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final ProjectExecutionSecurityHelper securityHelper;

    public ProjectLabourService(ProjectLabourEntryRepository labourRepository, ProjectExecutionWorkspaceRepository workspaceRepository, ProjectTaskRepository taskRepository, UserRepository userRepository, ProjectExecutionSecurityHelper securityHelper, EmployeeRepository employeeRepository) {
        this.labourRepository = labourRepository;
        this.workspaceRepository = workspaceRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.securityHelper = securityHelper;
    }

    @Transactional(readOnly = true)
    public List<ProjectLabourEntryDTO> getLabourEntriesByWorkspace(UUID workspaceId) {
        return labourRepository.findAll().stream()
                .filter(l -> l.getWorkspace().getId().equals(workspaceId))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectLabourEntryDTO recordLabour(ProjectLabourEntryDTO dto, UUID userId, Collection<? extends GrantedAuthority> authorities) {
        ProjectExecutionWorkspace workspace = securityHelper.getWorkspaceAndVerifyWriteAccess(dto.getWorkspaceId(), userId, authorities);
        
        ProjectTask task = taskRepository.findById(dto.getTaskId())
                .orElseThrow(() -> new RuntimeException("Task not found"));
                
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        ProjectLabourEntry entry = new ProjectLabourEntry();
        entry.setWorkspace(workspace);
        entry.setTask(task);
        entry.setEmployee(employee);
        entry.setWorkDate(dto.getWorkDate());
        entry.setHours(dto.getHours());
        entry.setDescription(dto.getDescription());
        entry.setSubmittedBy(userId);
        entry.setCreatedAt(OffsetDateTime.now());
        
        return mapToDTO(labourRepository.save(entry));
    }
    
    @Transactional
    public void approveLabour(UUID entryId, UUID userId, Collection<? extends GrantedAuthority> authorities) {
        ProjectLabourEntry entry = labourRepository.findById(entryId)
                .orElseThrow(() -> new RuntimeException("Labour entry not found"));
        
        securityHelper.getWorkspaceAndVerifyWriteAccess(entry.getWorkspace().getId(), userId, authorities);
        
        User approver = userRepository.findById(userId).orElseThrow();
        entry.setApprovedBy(approver);
        entry.setUpdatedAt(OffsetDateTime.now());
        labourRepository.save(entry);
    }
    
    @Transactional
    public void rejectLabour(UUID entryId, UUID userId, Collection<? extends GrantedAuthority> authorities) {
        ProjectLabourEntry entry = labourRepository.findById(entryId)
                .orElseThrow(() -> new RuntimeException("Labour entry not found"));
        
        securityHelper.getWorkspaceAndVerifyWriteAccess(entry.getWorkspace().getId(), userId, authorities);
        
        // simple deletion for rejected entries, or we could add a status field
        labourRepository.delete(entry);
    }

    private ProjectLabourEntryDTO mapToDTO(ProjectLabourEntry entry) {
        ProjectLabourEntryDTO dto = new ProjectLabourEntryDTO();
        dto.setId(entry.getId());
        dto.setWorkspaceId(entry.getWorkspace().getId());
        dto.setTaskId(entry.getTask().getId());
        dto.setTaskTitle(entry.getTask().getTitle());
        dto.setEmployeeId(entry.getEmployee().getId());
        dto.setEmployeeName(entry.getEmployee().getFirstName() + " " + entry.getEmployee().getLastName());
        dto.setWorkDate(entry.getWorkDate());
        dto.setHours(entry.getHours());
        dto.setDescription(entry.getDescription());
        dto.setSubmittedBy(entry.getSubmittedBy());
        if (entry.getApprovedBy() != null) {
            dto.setApprovedById(entry.getApprovedBy().getId());
            dto.setApprovedByName(entry.getApprovedBy().getFirstName() + " " + entry.getApprovedBy().getLastName());
        }
        dto.setCreatedAt(entry.getCreatedAt());
        return dto;
    }
}
