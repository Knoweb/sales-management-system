package com.knoweb.salesmanagement.projectexecution.controller;

import com.knoweb.salesmanagement.projectexecution.dto.ProjectIssueDTO;
import com.knoweb.salesmanagement.projectexecution.service.ProjectIssueService;
import com.knoweb.salesmanagement.security.principal.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/project-execution/issues")
public class ProjectIssueController {

    private final ProjectIssueService issueService;

    public ProjectIssueController(ProjectIssueService issueService) {
        this.issueService = issueService;
    }

    @GetMapping("/workspace/{workspaceId}")
    @PreAuthorize("hasAuthority('PROJECT_EXECUTION_READ')")
    public ResponseEntity<List<ProjectIssueDTO>> getIssuesByWorkspace(@PathVariable UUID workspaceId) {
        return ResponseEntity.ok(issueService.getIssuesByWorkspace(workspaceId));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectIssueDTO> reportIssue(
            @Valid @RequestBody ProjectIssueDTO dto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(issueService.reportIssue(dto, userDetails.getId(), userDetails.getAuthorities()));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectIssueDTO> updateIssueStatus(
            @PathVariable UUID id,
            @RequestParam String status,
            @RequestParam(required = false) String resolutionNote,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(issueService.updateIssueStatus(id, status, resolutionNote, userDetails.getId(), userDetails.getAuthorities()));
    }
}
