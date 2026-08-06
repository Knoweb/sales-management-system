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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.GrantedAuthority;
import java.util.Collection;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProjectTaskService {

    private final ProjectTaskRepository taskRepository;
    private final ProjectExecutionWorkspaceRepository workspaceRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final ProjectTaskDependencyRepository dependencyRepository;
    private final TaskStatusHistoryRepository historyRepository;
    private final ProjectExecutionWorkspaceService workspaceService;
    private final ProjectExecutionSecurityHelper securityHelper;

    public ProjectTaskService(ProjectTaskRepository taskRepository, ProjectExecutionWorkspaceRepository workspaceRepository, DepartmentRepository departmentRepository, UserRepository userRepository, ProjectTaskDependencyRepository dependencyRepository, TaskStatusHistoryRepository historyRepository, ProjectExecutionWorkspaceService workspaceService, ProjectExecutionSecurityHelper securityHelper) {
        this.taskRepository = taskRepository;
        this.workspaceRepository = workspaceRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.dependencyRepository = dependencyRepository;
        this.historyRepository = historyRepository;
        this.workspaceService = workspaceService;
        this.securityHelper = securityHelper;
    }


    public List<ProjectTaskDTO> getTasksByWorkspaceId(UUID workspaceId) {
        return taskRepository.findByWorkspaceId(workspaceId).stream()
                .map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public ProjectTaskDTO createTask(ProjectTaskDTO dto, UUID currentUserId, Collection<? extends GrantedAuthority> authorities) {
        ProjectExecutionWorkspace workspace = securityHelper.getWorkspaceAndVerifyWriteAccess(dto.getWorkspaceId(), currentUserId, authorities);

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
            User assignee = userRepository.findById(dto.getAssigneeId())
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
        
        return mapToDTO(task);
    }

    @Transactional
    public ProjectTaskDTO updateTaskStatus(UUID taskId, TaskStatus newStatus, BigDecimal completionPercentage, String comment, UUID currentUserId, Collection<? extends GrantedAuthority> authorities) {
        ProjectTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        securityHelper.getWorkspaceAndVerifyWriteAccess(task.getWorkspace().getId(), currentUserId, authorities);

        if (newStatus == TaskStatus.COMPLETED && (completionPercentage == null || completionPercentage.compareTo(new BigDecimal("100")) < 0)) {
            throw new RuntimeException("Completed task must have 100% completion");
        }
        
        if (newStatus == TaskStatus.IN_PROGRESS && (completionPercentage == null || completionPercentage.compareTo(BigDecimal.ZERO) == 0)) {
             // Dependencies check
             List<ProjectTaskDependency> deps = dependencyRepository.findByTaskId(taskId);
             for(ProjectTaskDependency dep : deps) {
                 if (dep.getPredecessor().getStatus() != TaskStatus.COMPLETED) {
                     throw new RuntimeException("Cannot start task: Predecessor '" + dep.getPredecessor().getTitle() + "' is not completed.");
                 }
             }
        }

        TaskStatus oldStatus = task.getStatus();
        BigDecimal oldPercentage = task.getCompletionPercentage();

        task.setStatus(newStatus);
        if (completionPercentage != null) {
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
        
        workspaceService.updateWorkspaceProgress(task.getWorkspace().getId());

        return mapToDTO(task);
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
        return dto;
    }

    @Transactional
    public ProjectTaskDTO updateTaskDetails(UUID taskId, ProjectTaskDTO dto, UUID userId, java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> authorities) {
        ProjectTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        securityHelper.getWorkspaceAndVerifyWriteAccess(task.getWorkspace().getId(), userId, authorities);
        
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setPlannedStartDate(dto.getPlannedStartDate());
        task.setPlannedEndDate(dto.getPlannedEndDate());
        task.setEstimatedHours(dto.getEstimatedHours());
        
        if (dto.getAssigneeId() != null) {
            com.knoweb.salesmanagement.user.entity.User assignee = userRepository.findById(dto.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
            task.setAssignee(assignee);
        } else {
            task.setAssignee(null);
        }
        
        task.setUpdatedAt(java.time.OffsetDateTime.now());
        return mapToDTO(taskRepository.save(task));
    }
}
