package com.knoweb.salesmanagement.projectexecution.controller;

import com.knoweb.salesmanagement.projectexecution.dto.ProjectTaskDTO;
import com.knoweb.salesmanagement.projectexecution.enums.TaskStatus;
import com.knoweb.salesmanagement.projectexecution.service.ProjectTaskService;
import com.knoweb.salesmanagement.security.principal.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/project-execution/tasks")
public class ProjectTaskController {

    private final ProjectTaskService taskService;

    public ProjectTaskController(ProjectTaskService taskService) {
        this.taskService = taskService;
    }


    @GetMapping("/workspace/{workspaceId}")
    @PreAuthorize("hasAuthority('PROJECT_EXECUTION_READ')")
    public ResponseEntity<List<ProjectTaskDTO>> getTasksByWorkspaceId(@PathVariable UUID workspaceId) {
        return ResponseEntity.ok(taskService.getTasksByWorkspaceId(workspaceId));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectTaskDTO> createTask(
            @Valid @RequestBody ProjectTaskDTO dto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(taskService.createTask(dto, userDetails.getId(), userDetails.getAuthorities()));
    }

    @PutMapping("/{taskId}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectTaskDTO> updateTaskStatus(
            @PathVariable UUID taskId,
            @RequestParam TaskStatus status,
            @RequestParam(required = false) BigDecimal completionPercentage,
            @RequestParam(required = false) String comment,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(taskService.updateTaskStatus(taskId, status, completionPercentage, comment, userDetails.getId(), userDetails.getAuthorities()));
    }

    @PostMapping("/{taskId}/dependencies/{predecessorId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> addTaskDependency(
            @PathVariable UUID taskId,
            @PathVariable UUID predecessorId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        taskService.addTaskDependency(taskId, predecessorId, userDetails.getId(), userDetails.getAuthorities());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{taskId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectTaskDTO> updateTask(
            @PathVariable UUID taskId,
            @Valid @RequestBody ProjectTaskDTO dto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(taskService.updateTaskDetails(taskId, dto, userDetails.getId(), userDetails.getAuthorities()));
    }
}
