package com.knoweb.salesmanagement.projectexecution.controller;

import com.knoweb.salesmanagement.projectexecution.dto.ProjectLabourEntryDTO;
import com.knoweb.salesmanagement.projectexecution.service.ProjectLabourService;
import com.knoweb.salesmanagement.security.principal.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/project-execution/labour")
public class ProjectLabourController {

    private final ProjectLabourService labourService;

    public ProjectLabourController(ProjectLabourService labourService) {
        this.labourService = labourService;
    }

    @GetMapping("/workspace/{workspaceId}")
    @PreAuthorize("hasAuthority('PROJECT_EXECUTION_READ')")
    public ResponseEntity<List<ProjectLabourEntryDTO>> getLabourEntriesByWorkspace(@PathVariable UUID workspaceId) {
        return ResponseEntity.ok(labourService.getLabourEntriesByWorkspace(workspaceId));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectLabourEntryDTO> recordLabour(
            @Valid @RequestBody ProjectLabourEntryDTO dto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(labourService.recordLabour(dto, userDetails.getId(), userDetails.getAuthorities()));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> approveLabour(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        labourService.approveLabour(id, userDetails.getId(), userDetails.getAuthorities());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/reject")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> rejectLabour(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        labourService.rejectLabour(id, userDetails.getId(), userDetails.getAuthorities());
        return ResponseEntity.ok().build();
    }
}
