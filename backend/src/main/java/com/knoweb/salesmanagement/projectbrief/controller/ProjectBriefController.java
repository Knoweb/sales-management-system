package com.knoweb.salesmanagement.projectbrief.controller;

import com.knoweb.salesmanagement.projectbrief.dto.ProjectBriefDTO;
import com.knoweb.salesmanagement.projectbrief.dto.ProjectBriefSubmitRequest;
import com.knoweb.salesmanagement.projectbrief.dto.ProjectBriefUpdateDraftRequest;
import com.knoweb.salesmanagement.projectbrief.service.ProjectBriefService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/opportunities/{opportunityId}/project-brief")
public class ProjectBriefController {

    private final ProjectBriefService projectBriefService;

    public ProjectBriefController(ProjectBriefService projectBriefService) {
        this.projectBriefService = projectBriefService;
    }

    @PostMapping("/initialize")
    @PreAuthorize("hasAuthority('PROJECT_BRIEF_CREATE')")
    public ProjectBriefDTO initializeProjectBrief(@PathVariable UUID opportunityId) {
        return projectBriefService.initializeProjectBrief(opportunityId);
    }
}
