package com.knoweb.salesmanagement.projectexecution.controller;

import com.knoweb.salesmanagement.projectexecution.dto.ProjectEmployeeAllocationDTO;
import com.knoweb.salesmanagement.projectexecution.service.ProjectResourceService;
import com.knoweb.salesmanagement.security.principal.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/project-execution/resources")
public class ProjectResourceController {

    private final ProjectResourceService resourceService;

    public ProjectResourceController(ProjectResourceService resourceService) {
        this.resourceService = resourceService;
    }


    @GetMapping("/allocations/workspace/{workspaceId}")
    @PreAuthorize("hasAuthority('PROJECT_EXECUTION_READ')")
    public ResponseEntity<List<ProjectEmployeeAllocationDTO>> getAllocationsByWorkspaceId(@PathVariable UUID workspaceId) {
        return ResponseEntity.ok(resourceService.getAllocationsByWorkspaceId(workspaceId));
    }

    @PostMapping("/allocations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> allocateEmployee(
            @Valid @RequestBody ProjectEmployeeAllocationDTO dto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        resourceService.allocateEmployee(dto, userDetails.getId(), userDetails.getAuthorities());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/allocations/{id}/deactivate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deactivateAllocation(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        resourceService.deactivateAllocation(id, userDetails.getId(), userDetails.getAuthorities());
        return ResponseEntity.ok().build();
    }
}
