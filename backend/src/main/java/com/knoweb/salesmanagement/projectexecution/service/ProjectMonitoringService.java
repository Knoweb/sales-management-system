package com.knoweb.salesmanagement.projectexecution.service;

import com.knoweb.salesmanagement.projectexecution.dto.DailyProgressUpdateDTO;
import com.knoweb.salesmanagement.projectexecution.dto.ProjectIssueDTO;
import com.knoweb.salesmanagement.projectexecution.entity.DailyProgressUpdate;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectExecutionWorkspace;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectIssue;
import com.knoweb.salesmanagement.projectexecution.repository.DailyProgressUpdateRepository;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectExecutionWorkspaceRepository;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectIssueRepository;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectTaskRepository;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectLabourEntryRepository;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectMaterialUsageRepository;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import com.knoweb.salesmanagement.projectexecution.dto.ProjectExecutionSummaryDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.GrantedAuthority;
import java.util.Collection;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProjectMonitoringService {
    
    private final DailyProgressUpdateRepository progressRepository;
    private final ProjectIssueRepository issueRepository;
    private final ProjectExecutionWorkspaceRepository workspaceRepository;
    private final ProjectTaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectLabourEntryRepository labourRepository;
    private final ProjectMaterialUsageRepository materialRepository;
    private final ProjectExecutionSecurityHelper securityHelper;

    public ProjectMonitoringService(
            DailyProgressUpdateRepository progressRepository, 
            ProjectIssueRepository issueRepository, 
            ProjectExecutionWorkspaceRepository workspaceRepository, 
            ProjectTaskRepository taskRepository, 
            UserRepository userRepository,
            ProjectLabourEntryRepository labourRepository,
            ProjectMaterialUsageRepository materialRepository,
            ProjectExecutionSecurityHelper securityHelper) {
        this.progressRepository = progressRepository;
        this.issueRepository = issueRepository;
        this.workspaceRepository = workspaceRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.labourRepository = labourRepository;
        this.materialRepository = materialRepository;
        this.securityHelper = securityHelper;
    }

    @Transactional(readOnly = true)
    public ProjectExecutionSummaryDTO getWorkspaceSummary(UUID workspaceId) {
        ProjectExecutionSummaryDTO summary = new ProjectExecutionSummaryDTO();
        
        ProjectExecutionWorkspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
                
        summary.setOverallProgress(workspace.getOverallProgress() != null ? workspace.getOverallProgress() : BigDecimal.ZERO);
        
        var tasks = taskRepository.findByWorkspaceId(workspaceId);
        summary.setTotalTasks(tasks.size());
        summary.setCompletedTasks(tasks.stream().filter(t -> "COMPLETED".equals(t.getStatus().name())).count());
        summary.setBlockedTasks(tasks.stream().filter(t -> "BLOCKED".equals(t.getStatus().name())).count());
        summary.setOverdueTasks(tasks.stream().filter(t -> {
            return !"COMPLETED".equals(t.getStatus().name()) 
                && t.getPlannedEndDate() != null 
                && t.getPlannedEndDate().isBefore(java.time.LocalDate.now());
        }).count());
        
        summary.setTotalEstimatedHours(tasks.stream()
                .map(t -> t.getEstimatedHours() != null ? t.getEstimatedHours() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
                
        summary.setTotalActualHours(tasks.stream()
                .map(t -> t.getActualHours() != null ? t.getActualHours() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
                
        var labourEntries = labourRepository.findByWorkspaceId(workspaceId);
        // Assuming labour cost per hour is 50 for simplicity if no specific rate is tracked, 
        // OR we just map totalHours * rate. Since we don't have rate easily, we can just sum a fixed rate or 0.
        // For accurate project costing, we might just sum hours for now, but the frontend asks for cost.
        BigDecimal labourCost = labourEntries.stream()
                .map(l -> l.getHours().multiply(new BigDecimal("50.00"))) // Placeholder rate
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.setLabourCostTotal(labourCost);
        
        var materials = materialRepository.findByWorkspaceId(workspaceId);
        BigDecimal materialCost = materials.stream()
                .map(m -> m.getTotalCost() != null ? m.getTotalCost() : (m.getUnitCost().multiply(m.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.setMaterialCostTotal(materialCost);
        
        return summary;
    }

    public List<DailyProgressUpdateDTO> getProgressUpdatesByWorkspace(UUID workspaceId) {
        return progressRepository.findByWorkspaceId(workspaceId).stream().map(p -> {
            DailyProgressUpdateDTO dto = new DailyProgressUpdateDTO();
            dto.setId(p.getId());
            dto.setWorkspaceId(p.getWorkspace().getId());
            if (p.getTask() != null) {
                dto.setTaskId(p.getTask().getId());
                dto.setTaskTitle(p.getTask().getTitle());
            }
            dto.setEmployeeId(p.getEmployee().getId());
            dto.setEmployeeName(p.getEmployee().getFirstName() + " " + p.getEmployee().getLastName());
            dto.setProgressDate(p.getProgressDate());
            dto.setWorkCompleted(p.getWorkCompleted());
            dto.setWorkPlannedNext(p.getWorkPlannedNext());
            dto.setBlockers(p.getBlockers());
            dto.setCompletionPercentage(p.getCompletionPercentage());
            dto.setHoursWorked(p.getHoursWorked());
            dto.setSubmittedAt(p.getSubmittedAt());
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void submitProgressUpdate(DailyProgressUpdateDTO dto, UUID currentUserId, Collection<? extends GrantedAuthority> authorities) {
        securityHelper.getWorkspaceAndVerifyWriteAccess(dto.getWorkspaceId(), currentUserId, authorities);
        DailyProgressUpdate update = new DailyProgressUpdate();
        update.setWorkspace(workspaceRepository.findById(dto.getWorkspaceId()).orElseThrow());
        if (dto.getTaskId() != null) {
            update.setTask(taskRepository.findById(dto.getTaskId()).orElseThrow());
        }
        update.setEmployee(userRepository.findById(dto.getEmployeeId()).orElseThrow());
        update.setProgressDate(dto.getProgressDate());
        update.setWorkCompleted(dto.getWorkCompleted());
        update.setWorkPlannedNext(dto.getWorkPlannedNext());
        update.setBlockers(dto.getBlockers());
        update.setCompletionPercentage(dto.getCompletionPercentage());
        update.setHoursWorked(dto.getHoursWorked());
        update.setSubmittedBy(currentUserId);
        
        progressRepository.save(update);
    }
}
