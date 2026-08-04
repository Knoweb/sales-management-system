package com.knoweb.salesmanagement.technicalproject.controller;

import com.knoweb.salesmanagement.technicalproject.dto.AssignedProjectSummaryDTO;
import com.knoweb.salesmanagement.technicalproject.service.ProjectTeamManagementService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * HOD-facing: lists projects assigned to a specific department.
 * GET /api/v1/departments/{deptId}/assigned-projects
 */
@RestController
@RequestMapping("/api/v1/departments")
public class DepartmentProjectController {

    private final ProjectTeamManagementService teamManagementService;

    public DepartmentProjectController(ProjectTeamManagementService teamManagementService) {
        this.teamManagementService = teamManagementService;
    }

    @GetMapping("/{deptId}/assigned-projects")
    @PreAuthorize("hasAuthority('PROJECT_TEAM_READ')")
    public Page<AssignedProjectSummaryDTO> getAssignedProjects(
            @PathVariable UUID deptId,
            Pageable pageable) {
        return teamManagementService.getAssignedProjects(deptId, pageable);
    }
}
