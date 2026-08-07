package com.knoweb.salesmanagement.projectexecution.controller;

import com.knoweb.salesmanagement.projectexecution.dto.ProjectExecutionDepartmentLookupDTO;
import com.knoweb.salesmanagement.projectexecution.dto.ProjectExecutionEmployeeLookupDTO;
import com.knoweb.salesmanagement.projectexecution.service.ProjectExecutionLookupService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/project-execution/lookups")
public class ProjectExecutionLookupController {

    private final ProjectExecutionLookupService lookupService;

    public ProjectExecutionLookupController(ProjectExecutionLookupService lookupService) {
        this.lookupService = lookupService;
    }

    @GetMapping("/employees")
    @PreAuthorize("hasAuthority('PROJECT_EXECUTION_READ') or hasAuthority('PROJECT_EXECUTION_WRITE')")
    public List<ProjectExecutionEmployeeLookupDTO> getEmployeeLookups() {
        return lookupService.getEmployeeLookups();
    }

    @GetMapping("/project-managers")
    @PreAuthorize("hasAuthority('PROJECT_EXECUTION_READ') or hasAuthority('PROJECT_EXECUTION_WRITE')")
    public List<ProjectExecutionEmployeeLookupDTO> getProjectManagerLookups() {
        return lookupService.getProjectManagerLookups();
    }

    @GetMapping("/departments")
    @PreAuthorize("hasAuthority('PROJECT_EXECUTION_READ') or hasAuthority('PROJECT_EXECUTION_WRITE')")
    public List<ProjectExecutionDepartmentLookupDTO> getDepartmentLookups() {
        return lookupService.getDepartmentLookups();
    }
}
