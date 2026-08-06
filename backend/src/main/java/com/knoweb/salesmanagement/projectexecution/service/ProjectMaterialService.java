package com.knoweb.salesmanagement.projectexecution.service;

import com.knoweb.salesmanagement.projectexecution.dto.ProjectMaterialUsageDTO;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectExecutionWorkspace;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectMaterialUsage;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectTask;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectExecutionWorkspaceRepository;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectMaterialUsageRepository;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectTaskRepository;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProjectMaterialService {

    private final ProjectMaterialUsageRepository materialRepository;
    private final ProjectTaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectExecutionSecurityHelper securityHelper;

    public ProjectMaterialService(ProjectMaterialUsageRepository materialRepository, ProjectTaskRepository taskRepository, UserRepository userRepository, ProjectExecutionSecurityHelper securityHelper) {
        this.materialRepository = materialRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.securityHelper = securityHelper;
    }

    @Transactional(readOnly = true)
    public List<ProjectMaterialUsageDTO> getMaterialsByWorkspace(UUID workspaceId) {
        return materialRepository.findAll().stream()
                .filter(m -> m.getWorkspace().getId().equals(workspaceId))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectMaterialUsageDTO recordMaterial(ProjectMaterialUsageDTO dto, UUID userId, Collection<? extends GrantedAuthority> authorities) {
        ProjectExecutionWorkspace workspace = securityHelper.getWorkspaceAndVerifyWriteAccess(dto.getWorkspaceId(), userId, authorities);

        ProjectMaterialUsage usage = new ProjectMaterialUsage();
        usage.setWorkspace(workspace);
        
        if (dto.getTaskId() != null) {
            ProjectTask task = taskRepository.findById(dto.getTaskId())
                    .orElseThrow(() -> new RuntimeException("Task not found"));
            usage.setTask(task);
        }
        
        usage.setMaterialCode(dto.getMaterialCode());
        usage.setMaterialName(dto.getMaterialName());
        usage.setQuantity(dto.getQuantity());
        usage.setUnit(dto.getUnit());
        usage.setUnitCost(dto.getUnitCost());
        
        // Backend calculates total cost!
        BigDecimal total = dto.getQuantity().multiply(dto.getUnitCost());
        usage.setTotalCost(total);
        
        usage.setUsageDate(dto.getUsageDate());
        usage.setRecordedBy(userId);
        usage.setCreatedAt(OffsetDateTime.now());
        
        return mapToDTO(materialRepository.save(usage));
    }
    
    @Transactional
    public void approveMaterial(UUID usageId, UUID userId, Collection<? extends GrantedAuthority> authorities) {
        ProjectMaterialUsage usage = materialRepository.findById(usageId)
                .orElseThrow(() -> new RuntimeException("Material usage not found"));
                
        securityHelper.getWorkspaceAndVerifyWriteAccess(usage.getWorkspace().getId(), userId, authorities);
        
        User approver = userRepository.findById(userId).orElseThrow();
        usage.setApprovedBy(approver);
        usage.setUpdatedAt(OffsetDateTime.now());
        materialRepository.save(usage);
    }
    
    @Transactional
    public void rejectMaterial(UUID usageId, UUID userId, Collection<? extends GrantedAuthority> authorities) {
        ProjectMaterialUsage usage = materialRepository.findById(usageId)
                .orElseThrow(() -> new RuntimeException("Material usage not found"));
                
        securityHelper.getWorkspaceAndVerifyWriteAccess(usage.getWorkspace().getId(), userId, authorities);
        materialRepository.delete(usage);
    }

    private ProjectMaterialUsageDTO mapToDTO(ProjectMaterialUsage usage) {
        ProjectMaterialUsageDTO dto = new ProjectMaterialUsageDTO();
        dto.setId(usage.getId());
        dto.setWorkspaceId(usage.getWorkspace().getId());
        if (usage.getTask() != null) {
            dto.setTaskId(usage.getTask().getId());
            dto.setTaskTitle(usage.getTask().getTitle());
        }
        dto.setMaterialCode(usage.getMaterialCode());
        dto.setMaterialName(usage.getMaterialName());
        dto.setQuantity(usage.getQuantity());
        dto.setUnit(usage.getUnit());
        dto.setUnitCost(usage.getUnitCost());
        dto.setTotalCost(usage.getTotalCost());
        dto.setUsageDate(usage.getUsageDate());
        dto.setRecordedBy(usage.getRecordedBy());
        if (usage.getApprovedBy() != null) {
            dto.setApprovedById(usage.getApprovedBy().getId());
            dto.setApprovedByName(usage.getApprovedBy().getFirstName() + " " + usage.getApprovedBy().getLastName());
        }
        dto.setCreatedAt(usage.getCreatedAt());
        return dto;
    }
}
