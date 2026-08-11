package com.knoweb.salesmanagement.projectexecution.service;

import com.knoweb.salesmanagement.department.entity.Department;
import com.knoweb.salesmanagement.department.repository.DepartmentRepository;
import com.knoweb.salesmanagement.projectexecution.dto.ProjectTaskDTO;
import com.knoweb.salesmanagement.projectexecution.dto.ProjectTaskDependencyDTO;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectExecutionWorkspace;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectTask;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectTaskDependency;
import com.knoweb.salesmanagement.projectexecution.entity.TaskStatusHistory;
import com.knoweb.salesmanagement.projectexecution.enums.TaskStatus;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectExecutionWorkspaceRepository;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectTaskDependencyRepository;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectTaskRepository;
import com.knoweb.salesmanagement.projectexecution.repository.TaskStatusHistoryRepository;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import com.knoweb.salesmanagement.employee.repository.EmployeeRepository;
import com.knoweb.salesmanagement.employee.entity.Employee;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.GrantedAuthority;
import java.util.Collection;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

import com.knoweb.salesmanagement.projectexecution.repository.DailyProgressUpdateRepository;
import com.knoweb.salesmanagement.projectexecution.entity.DailyProgressUpdate;
import java.time.LocalDate;

import org.springframework.context.ApplicationEventPublisher;
import com.knoweb.salesmanagement.notification.dto.InternalNotificationEvent;
import com.knoweb.salesmanagement.audit.dto.InternalAuditLogEvent;

@Service
public class ProjectTaskService {

    private final ProjectTaskRepository taskRepository;
    private final ProjectExecutionWorkspaceRepository workspaceRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final ProjectTaskDependencyRepository dependencyRepository;
    private final TaskStatusHistoryRepository historyRepository;
    private final ProjectExecutionWorkspaceService workspaceService;
    private final ProjectExecutionSecurityHelper securityHelper;
    private final DailyProgressUpdateRepository progressUpdateRepository;
    private final ApplicationEventPublisher eventPublisher;

    public ProjectTaskService(ProjectTaskRepository taskRepository, ProjectExecutionWorkspaceRepository workspaceRepository, DepartmentRepository departmentRepository, UserRepository userRepository, ProjectTaskDependencyRepository dependencyRepository, TaskStatusHistoryRepository historyRepository, ProjectExecutionWorkspaceService workspaceService, ProjectExecutionSecurityHelper securityHelper, EmployeeRepository employeeRepository, DailyProgressUpdateRepository progressUpdateRepository, ApplicationEventPublisher eventPublisher) {
        this.taskRepository = taskRepository;
        this.workspaceRepository = workspaceRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.dependencyRepository = dependencyRepository;
        this.historyRepository = historyRepository;
        this.workspaceService = workspaceService;
        this.securityHelper = securityHelper;
        this.progressUpdateRepository = progressUpdateRepository;
        this.eventPublisher = eventPublisher;
    }


    @Transactional(readOnly = true)
    public List<ProjectTaskDTO> getTasksByWorkspaceId(UUID workspaceId) {
        List<DailyProgressUpdate> updates = progressUpdateRepository.findByWorkspaceId(workspaceId);
        Map<UUID, LocalDate> latestUpdates = updates.stream()
                .collect(Collectors.groupingBy(
                        u -> u.getTask().getId(),
                        Collectors.mapping(DailyProgressUpdate::getProgressDate, Collectors.maxBy(LocalDate::compareTo))
                ))
                .entrySet().stream()
                .filter(e -> e.getValue().isPresent())
                .collect(Collectors.toMap(Map.Entry::getKey, e -> e.getValue().get()));

        return taskRepository.findByWorkspaceId(workspaceId).stream()
                .map(task -> mapToDTO(task, latestUpdates.get(task.getId())))
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectTaskDTO createTask(ProjectTaskDTO dto, UUID currentUserId, Collection<? extends GrantedAuthority> authorities) {
        ProjectExecutionWorkspace workspace = securityHelper.getWorkspaceAndVerifyWriteAccess(dto.getWorkspaceId(), currentUserId, authorities);

        if (workspace.getStatus() == com.knoweb.salesmanagement.projectexecution.enums.ExecutionWorkspaceStatus.CLOSED) {
            throw new IllegalArgumentException("Cannot create tasks for a CLOSED project workspace.");
        }

        ProjectTask task = new ProjectTask();
        task.setWorkspace(workspace);
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        
        if (dto.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found"));
            task.setDepartment(dept);
        }
        
        if (dto.getAssigneeId() != null) {
            Employee assignee = employeeRepository.findById(dto.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
            task.setAssignee(assignee);
        }

        task.setPriority(dto.getPriority());
        task.setPlannedStartDate(dto.getPlannedStartDate());
        task.setPlannedEndDate(dto.getPlannedEndDate());
        task.setEstimatedHours(dto.getEstimatedHours());
        task.setCreatedBy(currentUserId);
        
        task = taskRepository.save(task);
        
        // Log history
        TaskStatusHistory history = new TaskStatusHistory();
        history.setTask(task);
        history.setNewStatus(task.getStatus());
        history.setNewPercentage(task.getCompletionPercentage());
        history.setComment("Task created");
        history.setChangedBy(currentUserId);
        historyRepository.save(history);
        
        workspaceService.updateWorkspaceProgress(workspace.getId());
        
        ProjectTaskDTO resultDto = mapToDTO(task);
        InternalAuditLogEvent auditEvent = new InternalAuditLogEvent();
        auditEvent.setEventType("PROJECT_TASK_CREATED");
        auditEvent.setEntityType("ProjectTask");
        auditEvent.setEntityId(task.getId());
        auditEvent.setAction("CREATE");
        auditEvent.setNewState(resultDto);
        eventPublisher.publishEvent(auditEvent);

        if (task.getAssignee() != null && task.getAssignee().getUser() != null) {
            try {
                InternalNotificationEvent notif = new InternalNotificationEvent();
                notif.setEventType("TASK_ASSIGNED");
                notif.setTitle("New Task Assigned");
                notif.setMessage("You have been assigned to task: " + task.getTitle());
                notif.setEntityType("PROJECT_TASK");
                notif.setEntityId(task.getId());
                notif.setContextUrl("/execution-workspaces/" + task.getWorkspace().getId() + "/tasks");
                notif.setDeduplicationKey("task_assign_" + task.getId() + "_" + task.getAssignee().getUser().getId());
                notif.setRecipientUserIds(Set.of(task.getAssignee().getUser().getId()));
                eventPublisher.publishEvent(notif);
            } catch (Exception e) {
                System.err.println("Failed to send task assignment notification: " + e.getMessage());
            }
        }

        return resultDto;
    }

    @Transactional
    public ProjectTaskDTO updateTaskStatus(UUID taskId, TaskStatus newStatus, BigDecimal completionPercentage, String comment, UUID currentUserId, Collection<? extends GrantedAuthority> authorities) {
        ProjectTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        securityHelper.getWorkspaceAndVerifyWriteAccess(task.getWorkspace().getId(), currentUserId, authorities);

        ProjectTaskDTO previousDto = mapToDTO(task);

        if (task.getWorkspace().getStatus() == com.knoweb.salesmanagement.projectexecution.enums.ExecutionWorkspaceStatus.CLOSED) {
            throw new IllegalArgumentException("Cannot update tasks for a CLOSED project workspace.");
        }

        if (newStatus == TaskStatus.COMPLETED) {
            BigDecimal currentPercentage = completionPercentage != null ? completionPercentage : task.getCompletionPercentage();
            if (currentPercentage == null || currentPercentage.compareTo(new BigDecimal("100")) < 0) {
                throw new IllegalArgumentException("Task must reach 100% completion before it can be marked as completed.");
            }
        }
        
        if (newStatus == TaskStatus.IN_PROGRESS && (completionPercentage == null || completionPercentage.compareTo(BigDecimal.ZERO) == 0)) {
             // Dependencies check
             List<ProjectTaskDependency> deps = dependencyRepository.findByTaskId(taskId);
             for(ProjectTaskDependency dep : deps) {
                 if (dep.getPredecessor().getStatus() != TaskStatus.COMPLETED) {
                     throw new IllegalArgumentException("Cannot start task: Predecessor '" + dep.getPredecessor().getTitle() + "' is not completed.");
                 }
             }
        }

        TaskStatus oldStatus = task.getStatus();
        BigDecimal oldPercentage = task.getCompletionPercentage();

        task.setStatus(newStatus);
        if (completionPercentage != null) {
            if (completionPercentage.compareTo(BigDecimal.ZERO) < 0 || completionPercentage.compareTo(new BigDecimal("100")) > 0) {
                throw new IllegalArgumentException("Completion percentage must be between 0 and 100");
            }
            task.setCompletionPercentage(completionPercentage);
        }
        
        task = taskRepository.save(task);

        TaskStatusHistory history = new TaskStatusHistory();
        history.setTask(task);
        history.setPreviousStatus(oldStatus);
        history.setNewStatus(newStatus);
        history.setPreviousPercentage(oldPercentage);
        history.setNewPercentage(task.getCompletionPercentage());
        history.setComment(comment);
        history.setChangedBy(currentUserId);
        historyRepository.save(history);
        
        evaluateDelayEscalation(task);
        workspaceService.updateWorkspaceProgress(task.getWorkspace().getId());

        ProjectTaskDTO resultDto = mapToDTO(task);
        InternalAuditLogEvent auditEvent = new InternalAuditLogEvent();
        auditEvent.setEventType("PROJECT_TASK_STATUS_UPDATED");
        auditEvent.setEntityType("ProjectTask");
        auditEvent.setEntityId(task.getId());
        auditEvent.setAction("UPDATE_STATUS");
        auditEvent.setPreviousState(previousDto);
        auditEvent.setNewState(resultDto);
        eventPublisher.publishEvent(auditEvent);

        if (task.getWorkspace().getProjectManager() != null && task.getWorkspace().getProjectManager().getUser() != null) {
            try {
                InternalNotificationEvent notif = new InternalNotificationEvent();
                notif.setEventType("TASK_STATUS_UPDATED");
                notif.setTitle("Task Status Updated");
                notif.setMessage("Task '" + task.getTitle() + "' status changed to " + newStatus.name());
                notif.setEntityType("PROJECT_TASK");
                notif.setEntityId(task.getId());
                notif.setContextUrl("/execution-workspaces/" + task.getWorkspace().getId() + "/tasks");
                notif.setDeduplicationKey("task_status_" + task.getId() + "_" + newStatus.name() + "_" + System.currentTimeMillis());
                notif.setRecipientUserIds(Set.of(task.getWorkspace().getProjectManager().getUser().getId()));
                eventPublisher.publishEvent(notif);
            } catch (Exception e) {
                System.err.println("Failed to send task status notification: " + e.getMessage());
            }
        }

        return resultDto;
    }

    @Transactional
    public void addTaskDependency(UUID taskId, UUID predecessorId, UUID currentUserId, Collection<? extends GrantedAuthority> authorities) {
        if (taskId.equals(predecessorId)) {
            throw new RuntimeException("Task cannot depend on itself");
        }
        
        ProjectTask task = taskRepository.findById(taskId).orElseThrow(() -> new RuntimeException("Task not found"));
        securityHelper.getWorkspaceAndVerifyWriteAccess(task.getWorkspace().getId(), currentUserId, authorities);
        ProjectTask predecessor = taskRepository.findById(predecessorId).orElseThrow(() -> new RuntimeException("Predecessor not found"));
        
        // Circular dependency check (DFS)
        if (isCircularDependency(predecessorId, taskId)) {
            throw new RuntimeException("Circular dependency detected");
        }
        
        ProjectTaskDependency dep = new ProjectTaskDependency();
        dep.setTask(task);
        dep.setPredecessor(predecessor);
        dependencyRepository.save(dep);

        InternalAuditLogEvent auditEvent = new InternalAuditLogEvent();
        auditEvent.setEventType("PROJECT_TASK_DEPENDENCY_ADDED");
        auditEvent.setEntityType("ProjectTask");
        auditEvent.setEntityId(task.getId());
        auditEvent.setAction("ADD_DEPENDENCY");
        auditEvent.setNewState("Predecessor ID: " + predecessorId);
        eventPublisher.publishEvent(auditEvent);
    }
    
    private boolean isCircularDependency(UUID currentTaskId, UUID targetTaskId) {
        if (currentTaskId.equals(targetTaskId)) return true;
        List<ProjectTaskDependency> deps = dependencyRepository.findByTaskId(currentTaskId);
        for (ProjectTaskDependency dep : deps) {
            if (isCircularDependency(dep.getPredecessor().getId(), targetTaskId)) {
                return true;
            }
        }
        return false;
    }

    private ProjectTaskDTO mapToDTO(ProjectTask task) {
        // Find latest update if not provided in batch
        List<DailyProgressUpdate> updates = progressUpdateRepository.findByWorkspaceId(task.getWorkspace().getId());
        LocalDate latestUpdate = updates.stream()
            .filter(u -> u.getTask().getId().equals(task.getId()))
            .map(DailyProgressUpdate::getProgressDate)
            .max(LocalDate::compareTo).orElse(null);
        return mapToDTO(task, latestUpdate);
    }

    private ProjectTaskDTO mapToDTO(ProjectTask task, LocalDate latestUpdateDate) {
        ProjectTaskDTO dto = new ProjectTaskDTO();
        dto.setId(task.getId());
        dto.setWorkspaceId(task.getWorkspace().getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        if (task.getDepartment() != null) {
            dto.setDepartmentId(task.getDepartment().getId());
            dto.setDepartmentName(task.getDepartment().getName());
        }
        if (task.getAssignee() != null) {
            dto.setAssigneeId(task.getAssignee().getId());
            dto.setAssigneeName(task.getAssignee().getFirstName() + " " + task.getAssignee().getLastName());
        }
        dto.setPriority(task.getPriority());
        dto.setStatus(task.getStatus());
        dto.setPlannedStartDate(task.getPlannedStartDate());
        dto.setPlannedEndDate(task.getPlannedEndDate());
        dto.setActualStartDate(task.getActualStartDate());
        dto.setActualEndDate(task.getActualEndDate());
        dto.setEstimatedHours(task.getEstimatedHours());
        dto.setActualHours(task.getActualHours());
        dto.setCompletionPercentage(task.getCompletionPercentage());

        // P12-2 Logic
        boolean isCompleted = task.getCompletionPercentage() != null && task.getCompletionPercentage().compareTo(new BigDecimal("100")) >= 0;
        boolean isFinishedStatus = task.getStatus() == TaskStatus.COMPLETED || task.getStatus() == TaskStatus.CANCELLED;
        LocalDate today = LocalDate.now();
        boolean startedToday = task.getActualStartDate() != null && task.getActualStartDate().isEqual(today);

        if (isFinishedStatus) {
            dto.setExecutionStatus("N/A");
            dto.setDelayDays(0);
        } else {
            dto.setExecutionStatus("ON_TRACK");
            dto.setDelayDays(0);

            if (!isCompleted && task.getPlannedEndDate() != null && task.getPlannedEndDate().isBefore(today)) {
                dto.setExecutionStatus("DELAYED");
                dto.setDelayDays((int) java.time.temporal.ChronoUnit.DAYS.between(task.getPlannedEndDate(), today));
            } else if (!isCompleted && task.getStatus() == TaskStatus.IN_PROGRESS && !startedToday) {
                // Check for missing updates today or yesterday
                if (latestUpdateDate == null || latestUpdateDate.isBefore(today.minusDays(1))) {
                    dto.setExecutionStatus("NO_UPDATE");
                }
            }
        }

        return dto;
    }

    public void evaluateDelayEscalation(ProjectTask task) {
        boolean isCompleted = task.getCompletionPercentage() != null && task.getCompletionPercentage().compareTo(new BigDecimal("100")) >= 0;
        boolean isFinishedStatus = task.getStatus() == TaskStatus.COMPLETED || task.getStatus() == TaskStatus.CANCELLED;
        LocalDate today = LocalDate.now();

        if (!isCompleted && !isFinishedStatus && task.getPlannedEndDate() != null && task.getPlannedEndDate().isBefore(today)) {
            int delayDays = (int) java.time.temporal.ChronoUnit.DAYS.between(task.getPlannedEndDate(), today);
            
            // Send Notification
            if (task.getWorkspace().getProjectManager() != null && task.getWorkspace().getProjectManager().getUser() != null) {
                try {
                    String deduplicationKey = "delay_esc_" + task.getId() + "_" + task.getPlannedEndDate();
                    System.out.println("Publishing TASK_DELAYED: taskId=" + task.getId() + 
                                       ", dueDate=" + task.getPlannedEndDate() + 
                                       ", delayDays=" + delayDays + 
                                       ", projectManagerEmployeeId=" + task.getWorkspace().getProjectManager().getId() + 
                                       ", recipientUserId=" + task.getWorkspace().getProjectManager().getUser().getId() + 
                                       ", deduplicationKey=" + deduplicationKey);
                                       
                    InternalNotificationEvent event = new InternalNotificationEvent();
                    event.setEventType("TASK_DELAYED");
                    event.setTitle("Task Delayed: " + task.getTitle());
                    event.setMessage("Task is delayed by " + delayDays + " days past its due date.");
                    event.setEntityType("PROJECT_TASK");
                    event.setEntityId(task.getId());
                    event.setContextUrl("/execution-workspaces/" + task.getWorkspace().getId() + "/tasks");
                    event.setDeduplicationKey(deduplicationKey);
                    event.setRecipientUserIds(java.util.Set.of(task.getWorkspace().getProjectManager().getUser().getId()));
                    eventPublisher.publishEvent(event);
                } catch (Exception e) {
                    // Log and ignore to prevent breaking transactions
                    System.err.println("Failed to send delay escalation notification: " + e.getMessage());
                }
            } else {
                System.out.println("WARNING: Cannot send delay escalation notification for taskId=" + task.getId() + " - Project Manager is missing or has no linked User.");
            }
        }
    }

    @Transactional
    public ProjectTaskDTO updateTaskDetails(UUID taskId, ProjectTaskDTO dto, UUID userId, java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> authorities) {
        ProjectTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        securityHelper.getWorkspaceAndVerifyWriteAccess(task.getWorkspace().getId(), userId, authorities);
        
        ProjectTaskDTO previousDto = mapToDTO(task);
        Employee oldAssignee = task.getAssignee();
        
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setPlannedStartDate(dto.getPlannedStartDate());
        task.setPlannedEndDate(dto.getPlannedEndDate());
        task.setEstimatedHours(dto.getEstimatedHours());
        
        if (dto.getAssigneeId() != null) {
            Employee assignee = employeeRepository.findById(dto.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
            task.setAssignee(assignee);
        } else {
            task.setAssignee(null);
        }
        
        task.setUpdatedAt(java.time.OffsetDateTime.now());
        task = taskRepository.save(task);
        evaluateDelayEscalation(task);
        workspaceService.updateWorkspaceProgress(task.getWorkspace().getId());

        ProjectTaskDTO resultDto = mapToDTO(task);
        InternalAuditLogEvent auditEvent = new InternalAuditLogEvent();
        auditEvent.setEventType("PROJECT_TASK_DETAILS_UPDATED");
        auditEvent.setEntityType("ProjectTask");
        auditEvent.setEntityId(task.getId());
        auditEvent.setAction("UPDATE_DETAILS");
        auditEvent.setPreviousState(previousDto);
        auditEvent.setNewState(resultDto);
        eventPublisher.publishEvent(auditEvent);

        if (task.getAssignee() != null && !task.getAssignee().equals(oldAssignee) && task.getAssignee().getUser() != null) {
            try {
                InternalNotificationEvent notif = new InternalNotificationEvent();
                notif.setEventType("TASK_ASSIGNED");
                notif.setTitle("Task Assigned");
                notif.setMessage("You have been assigned to task: " + task.getTitle());
                notif.setEntityType("PROJECT_TASK");
                notif.setEntityId(task.getId());
                notif.setContextUrl("/execution-workspaces/" + task.getWorkspace().getId() + "/tasks");
                notif.setDeduplicationKey("task_assign_" + task.getId() + "_" + task.getAssignee().getUser().getId() + "_" + System.currentTimeMillis());
                notif.setRecipientUserIds(Set.of(task.getAssignee().getUser().getId()));
                eventPublisher.publishEvent(notif);
            } catch (Exception e) {
                System.err.println("Failed to send task assignment notification: " + e.getMessage());
            }
        }

        return resultDto;
    }
}
