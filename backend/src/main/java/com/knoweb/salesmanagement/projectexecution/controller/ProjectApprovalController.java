package com.knoweb.salesmanagement.projectexecution.controller;

import com.knoweb.salesmanagement.projectexecution.dto.ProjectApprovalRequestDTO;
import com.knoweb.salesmanagement.projectexecution.service.ProjectApprovalService;
import com.knoweb.salesmanagement.security.principal.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/project-execution/approvals")
public class ProjectApprovalController {

    private final ProjectApprovalService approvalService;

    public ProjectApprovalController(ProjectApprovalService approvalService) {
        this.approvalService = approvalService;
    }

    @GetMapping("/workspace/{workspaceId}")
    @PreAuthorize("hasAuthority('PROJECT_EXECUTION_READ')")
    public ResponseEntity<List<ProjectApprovalRequestDTO>> getApprovalsByWorkspace(@PathVariable UUID workspaceId) {
        return ResponseEntity.ok(approvalService.getApprovalsByWorkspace(workspaceId));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectApprovalRequestDTO> requestApproval(
            @Valid @RequestBody ProjectApprovalRequestDTO dto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(approvalService.requestApproval(dto, userDetails.getId(), userDetails.getAuthorities()));
    }

    @PutMapping("/{id}/decision")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectApprovalRequestDTO> updateDecision(
            @PathVariable UUID id,
            @RequestParam String status,
            @RequestParam(required = false) String comment,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(approvalService.updateDecision(id, status, comment, userDetails.getId(), userDetails.getAuthorities()));
    }
}
