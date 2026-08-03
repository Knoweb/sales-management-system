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

@RestController
@RequestMapping("/api/v1")
public class ClientVerificationController {

    private final ClientVerificationService clientVerificationService;

    public ClientVerificationController(ClientVerificationService clientVerificationService) {
        this.clientVerificationService = clientVerificationService;
    }

    @PreAuthorize("hasAuthority('CLIENT_VERIFICATION_CREATE')")
    @PostMapping("/project-briefs/{briefId}/create-verification")
    public ResponseEntity<Map<String, String>> createVerification(
            @PathVariable UUID briefId,
            @RequestBody(required = false) ClientVerificationRequest request) {
        String token = clientVerificationService.createVerification(briefId, request);
        return ResponseEntity.ok(Map.of("token", token));
    }

    @GetMapping("/client-verifications/{token}")
    public ResponseEntity<ClientVerificationDTO> getVerificationByToken(@PathVariable String token) {
        return ResponseEntity.ok(clientVerificationService.getVerificationByToken(token));
    }

    @PostMapping("/client-verifications/{token}/confirm")
    public ResponseEntity<ClientVerificationDTO> confirmVerification(@PathVariable String token, @Valid @RequestBody ClientDecisionRequest request) {
        return ResponseEntity.ok(clientVerificationService.confirmVerification(token, request));
    }

    @PostMapping("/client-verifications/{token}/request-changes")
    public ResponseEntity<ClientVerificationDTO> requestChanges(@PathVariable String token, @Valid @RequestBody ClientDecisionRequest request) {
        return ResponseEntity.ok(clientVerificationService.requestChanges(token, request));
    }

    @PostMapping("/client-verifications/{token}/reject")
    public ResponseEntity<ClientVerificationDTO> rejectVerification(@PathVariable String token, @Valid @RequestBody ClientDecisionRequest request) {
        return ResponseEntity.ok(clientVerificationService.rejectVerification(token, request));
    }

    @GetMapping("/opportunities/{opportunityId}/client-verifications")
    public ResponseEntity<List<ClientVerificationDTO>> getVerificationsForOpportunity(@PathVariable UUID opportunityId) {
        return ResponseEntity.ok(clientVerificationService.getVerificationsForOpportunity(opportunityId));
    }
}
