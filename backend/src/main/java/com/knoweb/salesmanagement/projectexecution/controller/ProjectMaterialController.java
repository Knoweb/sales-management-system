package com.knoweb.salesmanagement.projectexecution.controller;

import com.knoweb.salesmanagement.projectexecution.dto.ProjectMaterialUsageDTO;
import com.knoweb.salesmanagement.projectexecution.service.ProjectMaterialService;
import com.knoweb.salesmanagement.security.principal.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/project-execution/materials")
public class ProjectMaterialController {

    private final ProjectMaterialService materialService;

    public ProjectMaterialController(ProjectMaterialService materialService) {
        this.materialService = materialService;
    }

    @GetMapping("/workspace/{workspaceId}")
    @PreAuthorize("hasAuthority('PROJECT_EXECUTION_READ')")
    public ResponseEntity<List<ProjectMaterialUsageDTO>> getMaterialsByWorkspace(@PathVariable UUID workspaceId) {
        return ResponseEntity.ok(materialService.getMaterialsByWorkspace(workspaceId));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectMaterialUsageDTO> recordMaterial(
            @Valid @RequestBody ProjectMaterialUsageDTO dto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(materialService.recordMaterial(dto, userDetails.getId(), userDetails.getAuthorities()));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> approveMaterial(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        materialService.approveMaterial(id, userDetails.getId(), userDetails.getAuthorities());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/reject")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> rejectMaterial(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        materialService.rejectMaterial(id, userDetails.getId(), userDetails.getAuthorities());
        return ResponseEntity.ok().build();
    }
}
