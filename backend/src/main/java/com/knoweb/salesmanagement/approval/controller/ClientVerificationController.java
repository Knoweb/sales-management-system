package com.knoweb.salesmanagement.approval.controller;

import com.knoweb.salesmanagement.approval.dto.ClientDecisionRequest;
import com.knoweb.salesmanagement.approval.dto.ClientVerificationDTO;
import com.knoweb.salesmanagement.approval.dto.ClientVerificationRequest;
import com.knoweb.salesmanagement.approval.service.ClientVerificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/v1")
public class ClientVerificationController {

    private final ClientVerificationService clientVerificationService;
    private final com.knoweb.salesmanagement.approval.service.ClientApprovalDocumentService clientApprovalDocumentService;

    public ClientVerificationController(ClientVerificationService clientVerificationService,
                                        com.knoweb.salesmanagement.approval.service.ClientApprovalDocumentService clientApprovalDocumentService) {
        this.clientVerificationService = clientVerificationService;
        this.clientApprovalDocumentService = clientApprovalDocumentService;
    }

    @PreAuthorize("hasAuthority('CLIENT_VERIFICATION_CREATE')")
    @PostMapping("/project-briefs/{briefId}/create-verification")
    public ResponseEntity<Map<String, String>> createVerification(
            @PathVariable UUID briefId,
            @RequestBody(required = false) ClientVerificationRequest request) {
        String token = clientVerificationService.createVerification(briefId, request);
        return ResponseEntity.ok(Map.of("token", token));
    }

    @PreAuthorize("hasAuthority('CLIENT_VERIFICATION_CREATE')")
    @PostMapping("/client-verifications/{id}/regenerate")
    public ResponseEntity<Map<String, String>> regenerateVerification(@PathVariable UUID id) {
        String token = clientVerificationService.regenerateVerificationLink(id);
        return ResponseEntity.ok(Map.of("token", token));
    }

    @PreAuthorize("hasAuthority('CLIENT_VERIFICATION_CREATE')")
    @PostMapping("/client-verifications/{id}/revoke")
    public ResponseEntity<Void> revokeVerification(@PathVariable UUID id) {
        clientVerificationService.revokeVerificationLink(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAuthority('CLIENT_VERIFICATION_CREATE') or hasAuthority('CLIENT_VERIFICATION_READ_LINK')")
    @GetMapping("/client-verifications/{id}/link")
    public ResponseEntity<Map<String, String>> getVerificationLink(@PathVariable UUID id) {
        String token = clientVerificationService.getVerificationLink(id);
        return ResponseEntity.ok(Map.of("token", token));
    }

    @PreAuthorize("hasAuthority('CLIENT_VERIFICATION_CREATE')")
    @GetMapping("/opportunities/{opportunityId}/client-approval-document")
    public ResponseEntity<byte[]> getClientApprovalDocument(@PathVariable UUID opportunityId) {
        byte[] pdfBytes = clientApprovalDocumentService.generateClientApprovalDocument(opportunityId);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "OPP-" + opportunityId.toString().substring(0, 8) + "-client-approval.pdf");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    @PreAuthorize("hasAuthority('CLIENT_VERIFICATION_CREATE')")
    @PostMapping("/opportunities/{opportunityId}/mark-client-confirmed")
    public ResponseEntity<ClientVerificationDTO> markClientConfirmed(@PathVariable UUID opportunityId) {
        ClientVerificationDTO dto = clientVerificationService.markClientConfirmed(opportunityId);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/opportunities/{opportunityId}/client-verifications")
    public ResponseEntity<List<ClientVerificationDTO>> getVerificationsForOpportunity(@PathVariable UUID opportunityId) {
        return ResponseEntity.ok(clientVerificationService.getVerificationsForOpportunity(opportunityId));
    }
}
