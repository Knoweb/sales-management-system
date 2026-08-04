package com.knoweb.salesmanagement.technicalproject.controller;

import com.knoweb.salesmanagement.technicalproject.dto.EmployeeAvailabilityDTO;
import com.knoweb.salesmanagement.technicalproject.service.ProjectTeamManagementService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Availability search endpoint:
 * GET /api/v1/employees/availability
 */
@RestController
@RequestMapping("/api/v1/employees")
public class EmployeeAvailabilityController {

    private final ProjectTeamManagementService teamManagementService;

    public EmployeeAvailabilityController(ProjectTeamManagementService teamManagementService) {
        this.teamManagementService = teamManagementService;
    }

    @GetMapping("/availability")
    @PreAuthorize("hasAuthority('EMPLOYEE_ALLOCATION_READ')")
    public List<EmployeeAvailabilityDTO> searchAvailability(
            @RequestParam(required = false) UUID departmentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) List<UUID> skillIds,
            @RequestParam(required = false) BigDecimal proposedHours) {
        return teamManagementService.searchAvailability(departmentId, startDate, endDate, skillIds, proposedHours);
    }
}
