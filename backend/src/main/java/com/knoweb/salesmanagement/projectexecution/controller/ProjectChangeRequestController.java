package com.knoweb.salesmanagement.projectexecution.controller;

import com.knoweb.salesmanagement.projectexecution.dto.ProjectChangeRequestDTO;
import com.knoweb.salesmanagement.projectexecution.service.ProjectChangeRequestService;
import com.knoweb.salesmanagement.security.principal.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/project-execution/change-requests")
public class ProjectChangeRequestController {

    private final ProjectChangeRequestService changeService;

    public ProjectChangeRequestController(ProjectChangeRequestService changeService) {
        this.changeService = changeService;
    }

    @GetMapping("/workspace/{workspaceId}")
    @PreAuthorize("hasAuthority('PROJECT_EXECUTION_READ')")
    public ResponseEntity<List<ProjectChangeRequestDTO>> getChangeRequestsByWorkspace(@PathVariable UUID workspaceId) {
        return ResponseEntity.ok(changeService.getChangeRequestsByWorkspace(workspaceId));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectChangeRequestDTO> createChangeRequest(
            @Valid @RequestBody ProjectChangeRequestDTO dto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(changeService.createChangeRequest(dto, userDetails.getId(), userDetails.getAuthorities()));
    }

    @PutMapping("/{id}/review")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectChangeRequestDTO> reviewChangeRequest(
            @PathVariable UUID id,
            @RequestParam String status,
            @RequestParam(required = false) String comment,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(changeService.reviewChangeRequest(id, status, comment, userDetails.getId(), userDetails.getAuthorities()));
    }
}
