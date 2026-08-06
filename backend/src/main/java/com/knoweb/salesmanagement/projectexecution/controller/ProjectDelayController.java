package com.knoweb.salesmanagement.projectexecution.controller;

import com.knoweb.salesmanagement.projectexecution.dto.ProjectDelayReportDTO;
import com.knoweb.salesmanagement.projectexecution.service.ProjectDelayService;
import com.knoweb.salesmanagement.security.principal.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/project-execution/delays")
public class ProjectDelayController {

    private final ProjectDelayService delayService;

    public ProjectDelayController(ProjectDelayService delayService) {
        this.delayService = delayService;
    }

    @GetMapping("/workspace/{workspaceId}")
    @PreAuthorize("hasAuthority('PROJECT_EXECUTION_READ')")
    public ResponseEntity<List<ProjectDelayReportDTO>> getDelaysByWorkspace(@PathVariable UUID workspaceId) {
        return ResponseEntity.ok(delayService.getDelaysByWorkspace(workspaceId));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectDelayReportDTO> reportDelay(
            @Valid @RequestBody ProjectDelayReportDTO dto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(delayService.reportDelay(dto, userDetails.getId(), userDetails.getAuthorities()));
    }
}
