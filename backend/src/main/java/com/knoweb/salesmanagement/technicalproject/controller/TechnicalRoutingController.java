package com.knoweb.salesmanagement.technicalproject.controller;

import com.knoweb.salesmanagement.technicalproject.dto.*;
import com.knoweb.salesmanagement.technicalproject.service.TechnicalProjectInitializationService;
import com.knoweb.salesmanagement.technicalproject.service.TechnicalRoutingService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/technical-routing")
public class TechnicalRoutingController {

    private final TechnicalRoutingService technicalRoutingService;
    private final TechnicalProjectInitializationService initializationService;

    public TechnicalRoutingController(TechnicalRoutingService technicalRoutingService, 
                                      TechnicalProjectInitializationService initializationService) {
        this.technicalRoutingService = technicalRoutingService;
        this.initializationService = initializationService;
    }

    @GetMapping("/eligible-briefs")
    @PreAuthorize("hasAuthority('TECHNICAL_PROJECT_ROUTE')")
    public Page<EligibleProjectBriefSummaryDTO> getEligibleProjectBriefs(Pageable pageable) {
        return technicalRoutingService.getEligibleProjectBriefs(pageable);
    }

    @PostMapping("/project-briefs/{projectBriefId}/initialize")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('TECHNICAL_PROJECT_ROUTE')")
    public void initializeProject(@PathVariable UUID projectBriefId) {
        initializationService.initializeTechnicalProject(projectBriefId);
    }

    @GetMapping("/projects")
    @PreAuthorize("hasAuthority('TECHNICAL_PROJECT_ROUTE')")
    public Page<TechnicalProjectSummaryDTO> getTechnicalProjects(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) com.knoweb.salesmanagement.technicalproject.enums.TechnicalProjectStatus status,
            Pageable pageable) {
        return technicalRoutingService.getTechnicalProjectsQueue(search, status, pageable);
    }

    @GetMapping("/projects/{projectId}")
    @PreAuthorize("hasAuthority('TECHNICAL_PROJECT_ROUTE')")
    public TechnicalProjectDetailDTO getTechnicalProjectDetail(@PathVariable UUID projectId) {
        return technicalRoutingService.getTechnicalProjectDetail(projectId);
    }

    @PostMapping("/projects/{projectId}/route")
    @PreAuthorize("hasAuthority('TECHNICAL_PROJECT_ROUTE')")
    public void routeProject(@PathVariable UUID projectId, 
                             @Valid @RequestBody TechnicalRoutingRequest request) {
        technicalRoutingService.routeProject(projectId, request);
    }

    @PutMapping("/projects/{projectId}/route")
    @PreAuthorize("hasAuthority('TECHNICAL_PROJECT_ROUTING_REVISE')")
    public void reviseRouting(@PathVariable UUID projectId, 
                              @Valid @RequestBody TechnicalRoutingRevisionRequest request) {
        technicalRoutingService.reviseRouting(projectId, request);
    }
}
