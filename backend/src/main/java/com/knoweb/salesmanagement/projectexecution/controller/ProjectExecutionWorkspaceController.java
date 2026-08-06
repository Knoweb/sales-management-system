package com.knoweb.salesmanagement.projectexecution.controller;

import com.knoweb.salesmanagement.projectexecution.dto.ExecutionWorkspaceDTO;
import com.knoweb.salesmanagement.projectexecution.dto.SetupWorkspaceDTO;
import com.knoweb.salesmanagement.projectexecution.service.ProjectExecutionWorkspaceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/project-execution/workspaces")
public class ProjectExecutionWorkspaceController {

    private final ProjectExecutionWorkspaceService workspaceService;



    
    public ProjectExecutionWorkspaceController(ProjectExecutionWorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PROJECT_EXECUTION_WRITE')")
    public ResponseEntity<ExecutionWorkspaceDTO> createWorkspace(
            @RequestParam UUID technicalProjectId,
            @RequestParam(required = false) UUID projectManagerId) {
        return ResponseEntity.ok(workspaceService.createWorkspace(technicalProjectId, projectManagerId));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('PROJECT_EXECUTION_READ')")
    public ResponseEntity<List<ExecutionWorkspaceDTO>> getAllWorkspaces() {
        return ResponseEntity.ok(workspaceService.getAllWorkspaces());
    }

    @GetMapping("/eligible")
    @PreAuthorize("hasAuthority('PROJECT_EXECUTION_WRITE')")
    public ResponseEntity<List<ExecutionWorkspaceDTO>> getEligibleProjects() {
        return ResponseEntity.ok(workspaceService.getEligibleProjects());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PROJECT_EXECUTION_READ')")
    public ResponseEntity<ExecutionWorkspaceDTO> getWorkspaceById(@PathVariable UUID id) {
        return ResponseEntity.ok(workspaceService.getWorkspaceById(id));
    }

    @PutMapping("/{id}/setup")
    @PreAuthorize("hasAuthority('PROJECT_EXECUTION_WRITE')")
    public ResponseEntity<ExecutionWorkspaceDTO> setupWorkspace(
            @PathVariable UUID id,
            @Valid @RequestBody SetupWorkspaceDTO dto) {
        return ResponseEntity.ok(workspaceService.setupWorkspace(id, dto));
    }
}
