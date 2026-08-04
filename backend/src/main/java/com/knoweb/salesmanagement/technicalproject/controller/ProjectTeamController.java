package com.knoweb.salesmanagement.technicalproject.controller;

import com.knoweb.salesmanagement.technicalproject.dto.*;
import com.knoweb.salesmanagement.technicalproject.service.ProjectTeamManagementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Team management endpoints:
 *
 * POST   /api/v1/project-teams/department-assignments/{tpdId}  – create or return existing team
 * GET    /api/v1/project-teams/{teamId}                        – get team detail
 * POST   /api/v1/project-teams/{teamId}/members                – add member
 * PUT    /api/v1/project-teams/{teamId}/members/{memberId}     – update allocation
 * DELETE /api/v1/project-teams/{teamId}/members/{memberId}     – remove member
 * POST   /api/v1/project-teams/{teamId}/mark-ready             – mark team ready
 */
@RestController
@RequestMapping("/api/v1/project-teams")
public class ProjectTeamController {

    private final ProjectTeamManagementService teamManagementService;

    public ProjectTeamController(ProjectTeamManagementService teamManagementService) {
        this.teamManagementService = teamManagementService;
    }

    // -----------------------------------------------------------------------
    // Create / get team
    // -----------------------------------------------------------------------

    @PostMapping("/department-assignments/{tpdId}")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('PROJECT_TEAM_MANAGE')")
    public ProjectTeamDetailDTO createOrGetTeam(
            @PathVariable UUID tpdId,
            @RequestParam(required = false) String teamName) {
        return teamManagementService.createOrGetTeam(tpdId, teamName);
    }

    @GetMapping("/{teamId}")
    @PreAuthorize("hasAuthority('PROJECT_TEAM_READ')")
    public ProjectTeamDetailDTO getTeamDetail(@PathVariable UUID teamId) {
        return teamManagementService.getTeamDetail(teamId);
    }

    // -----------------------------------------------------------------------
    // Member management
    // -----------------------------------------------------------------------

    @PostMapping("/{teamId}/members")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('EMPLOYEE_ALLOCATION_MANAGE')")
    public ProjectTeamDetailDTO addMember(
            @PathVariable UUID teamId,
            @Valid @RequestBody AddTeamMemberRequest request) {
        return teamManagementService.addMember(teamId, request);
    }

    @PutMapping("/{teamId}/members/{memberId}")
    @PreAuthorize("hasAuthority('EMPLOYEE_ALLOCATION_MANAGE')")
    public ProjectTeamDetailDTO updateMemberAllocation(
            @PathVariable UUID teamId,
            @PathVariable UUID memberId,
            @Valid @RequestBody UpdateMemberAllocationRequest request) {
        return teamManagementService.updateMemberAllocation(teamId, memberId, request);
    }

    @DeleteMapping("/{teamId}/members/{memberId}")
    @PreAuthorize("hasAuthority('EMPLOYEE_ALLOCATION_MANAGE')")
    public ProjectTeamDetailDTO removeMember(
            @PathVariable UUID teamId,
            @PathVariable UUID memberId) {
        return teamManagementService.removeMember(teamId, memberId);
    }

    // -----------------------------------------------------------------------
    // Mark ready
    // -----------------------------------------------------------------------

    @PostMapping("/{teamId}/mark-ready")
    @PreAuthorize("hasAuthority('PROJECT_TEAM_MANAGE')")
    public ProjectTeamDetailDTO markTeamReady(@PathVariable UUID teamId) {
        return teamManagementService.markTeamReady(teamId);
    }
}
