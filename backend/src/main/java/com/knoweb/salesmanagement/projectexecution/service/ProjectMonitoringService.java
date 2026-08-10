package com.knoweb.salesmanagement.projectexecution.service;

import com.knoweb.salesmanagement.employee.repository.EmployeeRepository;
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
import com.knoweb.salesmanagement.projectexecution.entity.ProjectTask;
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

import org.springframework.context.ApplicationEventPublisher;
import com.knoweb.salesmanagement.notification.dto.InternalNotificationEvent;

@Service
public class ProjectMonitoringService {
    
    private final DailyProgressUpdateRepository progressRepository;
    private final ProjectIssueRepository issueRepository;
    private final ProjectExecutionWorkspaceRepository workspaceRepository;
    private final ProjectTaskRepository taskRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final ProjectLabourEntryRepository labourRepository;
    private final ProjectMaterialUsageRepository materialRepository;
    private final ProjectExecutionSecurityHelper securityHelper;
    private final ProjectExecutionWorkspaceService workspaceService;
    private final ProjectTaskService taskService;
    private final ApplicationEventPublisher eventPublisher;

    public ProjectMonitoringService(
            DailyProgressUpdateRepository progressRepository, 
            ProjectIssueRepository issueRepository, 
            ProjectExecutionWorkspaceRepository workspaceRepository, 
            ProjectTaskRepository taskRepository, 
            UserRepository userRepository,
            ProjectLabourEntryRepository labourRepository,
            ProjectMaterialUsageRepository materialRepository,
            ProjectExecutionSecurityHelper securityHelper,
            EmployeeRepository employeeRepository,
            ProjectExecutionWorkspaceService workspaceService,
            ProjectTaskService taskService,
            ApplicationEventPublisher eventPublisher) {
        this.progressRepository = progressRepository;
        this.issueRepository = issueRepository;
        this.workspaceRepository = workspaceRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.labourRepository = labourRepository;
        this.materialRepository = materialRepository;
        this.securityHelper = securityHelper;
        this.workspaceService = workspaceService;
        this.taskService = taskService;
        this.eventPublisher = eventPublisher;
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

    @Transactional(readOnly = true)
    public List<DailyProgressUpdateDTO> getProgressUpdatesByWorkspace(UUID workspaceId) {
        return progressRepository.findByWorkspaceId(workspaceId).stream().map(p -> {
            DailyProgressUpdateDTO dto = new DailyProgressUpdateDTO();
            dto.setId(p.getId());
            if (p.getWorkspace() != null) {
                dto.setWorkspaceId(p.getWorkspace().getId());
            }
            if (p.getTask() != null) {
                dto.setTaskId(p.getTask().getId());
                dto.setTaskTitle(p.getTask().getTitle());
            }
            if (p.getEmployee() != null) {
                dto.setEmployeeId(p.getEmployee().getId());
                dto.setEmployeeName(p.getEmployee().getFirstName() + " " + p.getEmployee().getLastName());
            }
            dto.setProgressDate(p.getProgressDate());
            dto.setWorkCompleted(p.getWorkCompleted());
            dto.setWorkPlannedNext(p.getWorkPlannedNext());
            dto.setBlockers(p.getBlockers());
            dto.setCompletionPercentage(p.getCompletionPercentage());
            dto.setHoursWorked(p.getHoursWorked());
            dto.setSubmittedAt(p.getSubmittedAt());
            dto.setSupportRequired(p.getSupportRequired());
            dto.setSupportDetails(p.getSupportDetails());
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void submitProgressUpdate(DailyProgressUpdateDTO dto, UUID currentUserId, Collection<? extends GrantedAuthority> authorities) {
        ProjectExecutionWorkspace workspace = securityHelper.getWorkspaceAndVerifyWriteAccess(dto.getWorkspaceId(), currentUserId, authorities);
        
        if (workspace.getStatus() == com.knoweb.salesmanagement.projectexecution.enums.ExecutionWorkspaceStatus.CLOSED) {
            throw new IllegalArgumentException("Cannot submit progress updates for a CLOSED project workspace.");
        }

        DailyProgressUpdate update = new DailyProgressUpdate();
        update.setWorkspace(workspace);
        
        ProjectTask task = null;
        if (dto.getTaskId() != null) {
            task = taskRepository.findById(dto.getTaskId()).orElseThrow();
            if (task.getStatus() == com.knoweb.salesmanagement.projectexecution.enums.TaskStatus.CANCELLED) {
                throw new IllegalArgumentException("Cannot submit daily progress for a cancelled task.");
            }
            update.setTask(task);
        }
        update.setEmployee(employeeRepository.findById(dto.getEmployeeId()).orElseThrow());
        update.setProgressDate(dto.getProgressDate());
        update.setWorkCompleted(dto.getWorkCompleted());
        update.setWorkPlannedNext(dto.getWorkPlannedNext());
        update.setBlockers(dto.getBlockers());
        
        BigDecimal pct = dto.getCompletionPercentage() != null ? dto.getCompletionPercentage() : BigDecimal.ZERO;
        if (pct.compareTo(new BigDecimal("100")) > 0 || pct.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Completion percentage must be between 0 and 100");
        }
        update.setCompletionPercentage(pct);
        
        update.setHoursWorked(dto.getHoursWorked());
        update.setSupportRequired(dto.getSupportRequired() != null ? dto.getSupportRequired() : false);
        update.setSupportDetails(dto.getSupportDetails());
        update.setSubmittedBy(currentUserId);
        
        progressRepository.saveAndFlush(update);

        if (task != null) {
            task.setCompletionPercentage(pct);
            
            // Auto-complete if 100% and not CANCELLED
            if (pct.compareTo(new BigDecimal("100")) >= 0 && task.getStatus() != com.knoweb.salesmanagement.projectexecution.enums.TaskStatus.CANCELLED) {
                task.setStatus(com.knoweb.salesmanagement.projectexecution.enums.TaskStatus.COMPLETED);
                if (task.getActualEndDate() == null) {
                    task.setActualEndDate(java.time.LocalDate.now());
                }
            }
            
            taskRepository.saveAndFlush(task);
            
            // Support Request Notification
            if (Boolean.TRUE.equals(update.getSupportRequired()) && workspace.getProjectManager() != null && workspace.getProjectManager().getUser() != null) {
                try {
                    InternalNotificationEvent event = new InternalNotificationEvent();
                    event.setEventType("SUPPORT_REQUESTED");
                    event.setTitle("Support Requested for Task: " + task.getTitle());
                    event.setMessage(update.getSupportDetails() != null ? update.getSupportDetails() : "No details provided");
                    event.setEntityType("PROJECT_TASK");
                    event.setEntityId(task.getId());
                    event.setContextUrl("/execution-workspaces/" + workspace.getId() + "/progress");
                    event.setDeduplicationKey("support_req_" + task.getId() + "_" + update.getProgressDate());
                    event.setRecipientUserIds(java.util.Set.of(workspace.getProjectManager().getUser().getId()));
                    eventPublisher.publishEvent(event);
                } catch (Exception e) {
                    System.err.println("Failed to send support request notification: " + e.getMessage());
                }
            }
            
            // Evaluate delay escalation
            taskService.evaluateDelayEscalation(task);
        }

        workspaceService.updateWorkspaceProgress(workspace.getId());
    }
}
