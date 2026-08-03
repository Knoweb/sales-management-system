package com.knoweb.salesmanagement.approval.controller;

import com.knoweb.salesmanagement.approval.dto.ClientDecisionRequest;
import com.knoweb.salesmanagement.approval.dto.ClientVerificationDTO;
import com.knoweb.salesmanagement.approval.service.ClientVerificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public")
public class PublicClientVerificationController {

    private final ClientVerificationService clientVerificationService;

    public PublicClientVerificationController(ClientVerificationService clientVerificationService) {
        this.clientVerificationService = clientVerificationService;
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
}
