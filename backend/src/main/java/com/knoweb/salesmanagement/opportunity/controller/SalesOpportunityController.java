package com.knoweb.salesmanagement.opportunity.controller;

import com.knoweb.salesmanagement.lead.dto.ConvertLeadRequest;
import com.knoweb.salesmanagement.opportunity.dto.OpportunityActivityDTO;
import com.knoweb.salesmanagement.opportunity.dto.SalesOpportunityDTO;
import com.knoweb.salesmanagement.opportunity.dto.SalesOpportunitySummaryDTO;
import com.knoweb.salesmanagement.opportunity.enums.OpportunityStage;
import com.knoweb.salesmanagement.opportunity.service.SalesOpportunityService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class SalesOpportunityController {

    private final SalesOpportunityService opportunityService;

    public SalesOpportunityController(SalesOpportunityService opportunityService) {
        this.opportunityService = opportunityService;
    }

    @PostMapping("/leads/{leadId}/convert-to-opportunity")
    @PreAuthorize("hasAuthority('OPPORTUNITY_CREATE')")
    public SalesOpportunityDTO convertLeadToOpportunity(
            @PathVariable UUID leadId,
            @Valid @RequestBody ConvertLeadRequest request) {
        return opportunityService.convertLeadToOpportunity(leadId, request);
    }

    @GetMapping("/opportunities")
    @PreAuthorize("hasAuthority('OPPORTUNITY_READ')")
    public Page<SalesOpportunitySummaryDTO> searchOpportunities(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) OpportunityStage stage,
            @RequestParam(required = false) UUID clientId,
            Pageable pageable) {
        return opportunityService.searchOpportunities(search, stage, clientId, pageable);
    }

    @GetMapping("/opportunities/{id}")
    @PreAuthorize("hasAuthority('OPPORTUNITY_READ')")
    public SalesOpportunityDTO getOpportunity(@PathVariable UUID id) {
        return opportunityService.getOpportunity(id);
    }
}
