package com.knoweb.salesmanagement.quotation.controller;

import com.knoweb.salesmanagement.quotation.dto.QuotationDto;
import com.knoweb.salesmanagement.quotation.service.QuotationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/quotations")
public class QuotationController {

    private final QuotationService quotationService;

    public QuotationController(QuotationService quotationService) {
        this.quotationService = quotationService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('QUOTATION_READ') or hasAuthority('QUOTATION_APPROVE')")
    public ResponseEntity<java.util.List<QuotationDto>> getAllQuotations() {
        return ResponseEntity.ok(quotationService.getAllQuotations());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('QUOTATION_READ') or hasAuthority('QUOTATION_APPROVE')")
    public ResponseEntity<QuotationDto> getQuotation(@PathVariable UUID id) {
        return ResponseEntity.ok(quotationService.getQuotationById(id));
    }

    @GetMapping("/{id}/follow-ups")
    @PreAuthorize("hasAuthority('QUOTATION_READ') or hasAuthority('QUOTATION_APPROVE')")
    public ResponseEntity<java.util.List<com.knoweb.salesmanagement.lead.dto.FollowUpDTO>> getQuotationFollowUps(@PathVariable UUID id) {
        return ResponseEntity.ok(quotationService.getFollowUpsForQuotation(id));
    }

    /**
     * Create a new quotation.
     */
    @PostMapping
    @PreAuthorize("hasAuthority('QUOTATION_CREATE')")
    public ResponseEntity<QuotationDto> createQuotation(@RequestBody QuotationDto request) {
        return ResponseEntity.ok(quotationService.createQuotation(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('QUOTATION_CREATE')")
    public ResponseEntity<QuotationDto> updateQuotation(@PathVariable UUID id, @RequestBody QuotationDto request) {
        return ResponseEntity.ok(quotationService.updateQuotation(id, request));
    }

    @PostMapping("/{id}/submit-for-approval")
    @PreAuthorize("hasAuthority('QUOTATION_CREATE')")
    public ResponseEntity<QuotationDto> submitForApproval(@PathVariable UUID id) {
        return ResponseEntity.ok(quotationService.submitForTopManagementApproval(id));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('QUOTATION_APPROVE')")
    public ResponseEntity<QuotationDto> processTopManagementApproval(
            @PathVariable UUID id, 
            @RequestBody com.knoweb.salesmanagement.quotation.dto.QuotationApprovalDto request) {
        return ResponseEntity.ok(quotationService.processTopManagementApproval(id, request));
    }

    @PostMapping("/{id}/mark-sent")
    @PreAuthorize("hasAnyAuthority('QUOTATION_CREATE', 'QUOTATION_APPROVE')")
    public ResponseEntity<QuotationDto> markAsSentToClient(@PathVariable UUID id) {
        return ResponseEntity.ok(quotationService.markAsSentToClient(id));
    }

    @PostMapping("/{id}/client-decision")
    @PreAuthorize("hasAnyAuthority('QUOTATION_CREATE', 'QUOTATION_APPROVE')")
    public ResponseEntity<QuotationDto> updateClientDecision(
            @PathVariable UUID id, 
            @RequestBody com.knoweb.salesmanagement.quotation.dto.ClientDecisionDto request) {
        return ResponseEntity.ok(quotationService.updateClientDecision(id, request));
    }

    @GetMapping("/{id}/approval-history")
    @PreAuthorize("hasAuthority('QUOTATION_READ') or hasAuthority('QUOTATION_APPROVE')")
    public ResponseEntity<java.util.List<com.knoweb.salesmanagement.quotation.dto.QuotationApprovalHistoryDto>> getApprovalHistory(@PathVariable UUID id) {
        return ResponseEntity.ok(quotationService.getApprovalHistory(id));
    }
}
