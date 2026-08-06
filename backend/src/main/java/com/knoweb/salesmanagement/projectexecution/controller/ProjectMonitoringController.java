package com.knoweb.salesmanagement.projectexecution.controller;

import com.knoweb.salesmanagement.projectexecution.dto.DailyProgressUpdateDTO;
import com.knoweb.salesmanagement.projectexecution.dto.ProjectExecutionSummaryDTO;
import com.knoweb.salesmanagement.projectexecution.service.ProjectMonitoringService;
import com.knoweb.salesmanagement.security.principal.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/project-execution/monitoring")
public class ProjectMonitoringController {

    private final ProjectMonitoringService monitoringService;

    public ProjectMonitoringController(ProjectMonitoringService monitoringService) {
        this.monitoringService = monitoringService;
    }

    @GetMapping("/workspace/{workspaceId}/summary")
    @PreAuthorize("hasAuthority('PROJECT_EXECUTION_READ')")
    public ResponseEntity<ProjectExecutionSummaryDTO> getWorkspaceSummary(@PathVariable UUID workspaceId) {
        return ResponseEntity.ok(monitoringService.getWorkspaceSummary(workspaceId));
    }

    @GetMapping("/progress/workspace/{workspaceId}")
    @PreAuthorize("hasAuthority('PROJECT_EXECUTION_READ')")
    public ResponseEntity<List<DailyProgressUpdateDTO>> getProgressUpdatesByWorkspace(@PathVariable UUID workspaceId) {
        return ResponseEntity.ok(monitoringService.getProgressUpdatesByWorkspace(workspaceId));
    }

    @PostMapping("/progress")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> submitProgressUpdate(
            @Valid @RequestBody DailyProgressUpdateDTO dto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        monitoringService.submitProgressUpdate(dto, userDetails.getId(), userDetails.getAuthorities());
        return ResponseEntity.ok().build();
    }
}
