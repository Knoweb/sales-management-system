package com.knoweb.salesmanagement.lead.controller;


import com.knoweb.salesmanagement.lead.dto.*;
import com.knoweb.salesmanagement.lead.enums.LeadStatus;
import com.knoweb.salesmanagement.lead.service.LeadService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/leads")
public class LeadController {

    private final LeadService leadService;

    public LeadController(LeadService leadService) {
        this.leadService = leadService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('LEAD_READ')")
    public ResponseEntity<Page<LeadDTO>> searchLeads(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) LeadStatus status,
            @RequestParam(required = false) Boolean active,
            Pageable pageable) {
        Page<LeadDTO> page = leadService.searchLeads(search, status, active, pageable);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('LEAD_READ')")
    public ResponseEntity<LeadDTO> getLead(@PathVariable UUID id) {
        return ResponseEntity.ok(leadService.getLeadById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('LEAD_CREATE')")
    public ResponseEntity<LeadDTO> createLead(@Valid @RequestBody LeadRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leadService.createLead(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('LEAD_UPDATE')")
    public ResponseEntity<LeadDTO> updateLead(
            @PathVariable UUID id,
            @Valid @RequestBody LeadRequest request) {
        return ResponseEntity.ok(leadService.updateLead(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('LEAD_DELETE')")
    public ResponseEntity<Void> deleteLead(@PathVariable UUID id) {
        leadService.deleteLead(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping({ "/{id}/assign", "/{id}/assignee" })
    @PreAuthorize("hasAuthority('LEAD_ASSIGN')")
    public ResponseEntity<LeadDTO> assignLead(
            @PathVariable UUID id,
            @Valid @RequestBody LeadAssignRequest request) {
        return ResponseEntity.ok(leadService.assignLead(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('LEAD_UPDATE')")
    public ResponseEntity<LeadDTO> updateLeadStatus(
            @PathVariable UUID id,
            @Valid @RequestBody LeadStatusRequest request) {
        return ResponseEntity.ok(leadService.updateLeadStatus(id, request));
    }

    @PostMapping("/{id}/activities")
    @PreAuthorize("hasAuthority('LEAD_ACTIVITY_CREATE')")
    public ResponseEntity<LeadActivityDTO> addActivity(
            @PathVariable UUID id,
            @Valid @RequestBody LeadActivityRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leadService.addActivity(id, request));
    }

    @GetMapping("/{id}/activities")
    @PreAuthorize("hasAuthority('LEAD_READ')")
    public ResponseEntity<List<LeadActivityDTO>> getActivities(@PathVariable UUID id) {
        return ResponseEntity.ok(leadService.getActivities(id));
    }

    @PostMapping("/{id}/follow-ups")
    @PreAuthorize("hasAuthority('FOLLOW_UP_MANAGE')")
    public ResponseEntity<FollowUpDTO> addFollowUp(
            @PathVariable UUID id,
            @Valid @RequestBody FollowUpRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leadService.addFollowUp(id, request));
    }

    @GetMapping("/{id}/follow-ups")
    @PreAuthorize("hasAuthority('LEAD_READ')")
    public ResponseEntity<List<FollowUpDTO>> getFollowUps(@PathVariable UUID id) {
        return ResponseEntity.ok(leadService.getFollowUps(id));
    }

    @PutMapping("/{id}/follow-ups/{followUpId}")
    @PreAuthorize("hasAuthority('FOLLOW_UP_MANAGE')")
    public ResponseEntity<FollowUpDTO> updateFollowUp(
            @PathVariable UUID id,
            @PathVariable UUID followUpId,
            @Valid @RequestBody FollowUpRequest request) {
        return ResponseEntity.ok(leadService.updateFollowUp(id, followUpId, request));
    }

    @PatchMapping("/{id}/follow-ups/{followUpId}/complete")
    @PreAuthorize("hasAuthority('FOLLOW_UP_MANAGE')")
    public ResponseEntity<FollowUpDTO> completeFollowUp(
            @PathVariable UUID id,
            @PathVariable UUID followUpId,
            @RequestBody(required = false) FollowUpCompleteRequest request) {
        return ResponseEntity.ok(leadService.completeFollowUp(id, followUpId, request));
    }
}
