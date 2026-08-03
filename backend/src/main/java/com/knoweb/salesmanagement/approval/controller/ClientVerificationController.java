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

    @PreAuthorize("hasAuthority('CLIENT_VERIFICATION_READ_LINK')")
    @GetMapping("/client-verifications/{id}/link")
    public ResponseEntity<Map<String, String>> getVerificationLink(@PathVariable UUID id) {
        String token = clientVerificationService.getVerificationLink(id);
        return ResponseEntity.ok(Map.of("token", token));
    }

    @GetMapping("/opportunities/{opportunityId}/client-verifications")
    public ResponseEntity<List<ClientVerificationDTO>> getVerificationsForOpportunity(@PathVariable UUID opportunityId) {
        return ResponseEntity.ok(clientVerificationService.getVerificationsForOpportunity(opportunityId));
    }
}
