package com.knoweb.salesmanagement.approval.service;

import com.knoweb.salesmanagement.approval.dto.ClientDecisionRequest;
import com.knoweb.salesmanagement.approval.dto.ClientVerificationDTO;
import com.knoweb.salesmanagement.approval.entity.ClientVerification;
import com.knoweb.salesmanagement.approval.enums.ClientVerificationStatus;
import com.knoweb.salesmanagement.approval.repository.ClientVerificationRepository;
import com.knoweb.salesmanagement.common.exception.ResourceNotFoundException;
import com.knoweb.salesmanagement.projectbrief.entity.ProjectBrief;
import com.knoweb.salesmanagement.projectbrief.repository.ProjectBriefRepository;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import com.knoweb.salesmanagement.notification.service.NotificationService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ClientVerificationService {
    private static final Logger log = LoggerFactory.getLogger(ClientVerificationService.class);
    private final ClientVerificationRepository clientVerificationRepository;
    private final ProjectBriefRepository projectBriefRepository;
    private final UserRepository userRepository;
    private final WorkflowTransitionService transitionService;
    private final NotificationService notificationService;

    public ClientVerificationService(ClientVerificationRepository clientVerificationRepository,
                                     ProjectBriefRepository projectBriefRepository,
                                     UserRepository userRepository,
                                     WorkflowTransitionService transitionService,
                                     NotificationService notificationService) {
        this.clientVerificationRepository = clientVerificationRepository;
        this.projectBriefRepository = projectBriefRepository;
        this.userRepository = userRepository;
        this.transitionService = transitionService;
        this.notificationService = notificationService;
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        return userRepository.findByEmail(auth.getName()).orElseThrow(() -> new AccessDeniedException("User not found"));
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing token", e);
        }
    }

    @PreAuthorize("hasAuthority('CLIENT_VERIFICATION_CREATE')")
    @Transactional
    public String createVerification(UUID briefId, com.knoweb.salesmanagement.approval.dto.ClientVerificationRequest request) {
        ProjectBrief brief = projectBriefRepository.findById(briefId).orElseThrow(() -> new ResourceNotFoundException("Brief not found"));
        User user = getAuthenticatedUser();
        
        transitionService.createClientVerification(brief, user);

        String plainToken = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
        String tokenHash = hashToken(plainToken);

        ClientVerification verification = new ClientVerification();
        verification.setOpportunity(brief.getOpportunity());
        verification.setProjectBrief(brief);
        verification.setProjectBriefVersionNumber(brief.getCurrentVersionNumber());
        verification.setTokenHash(tokenHash);
        verification.setStatus(ClientVerificationStatus.PENDING);
        
        if (request != null && request.getExpiresAt() != null) {
            verification.setExpiresAt(request.getExpiresAt());
        } else {
            verification.setExpiresAt(OffsetDateTime.now().plusDays(7));
        }
        
        if (request != null) {
            verification.setVerifierName(request.getVerifierName());
            verification.setVerifierEmail(request.getVerifierEmail());
        }
        
        verification.setCreatedBy(user);
        
        clientVerificationRepository.save(verification);
        
        return plainToken;
    }

    public ClientVerificationDTO getVerificationByToken(String token) {
        String tokenHash = hashToken(token);
        ClientVerification verification = clientVerificationRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired verification link"));
                
        if (verification.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new IllegalArgumentException("Verification link has expired");
        }
        
        return mapToDTO(verification);
    }

    @Transactional
    public ClientVerificationDTO confirmVerification(String token, ClientDecisionRequest request) {
        String tokenHash = hashToken(token);
        ClientVerification verification = clientVerificationRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired verification link"));

        if (verification.getStatus() != ClientVerificationStatus.PENDING) {
            throw new IllegalArgumentException("This verification request has already been processed.");
        }
        if (verification.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new IllegalArgumentException("Verification link has expired");
        }

        ProjectBrief brief = projectBriefRepository.findById(verification.getProjectBrief().getId()).orElseThrow();
        transitionService.confirmClientVerification(brief, request.getVerifierName(), request.getComments());

        verification.setStatus(ClientVerificationStatus.CONFIRMED);
        verification.setVerifierName(request.getVerifierName());
        verification.setVerifierEmail(request.getVerifierEmail());
        verification.setClientComments(request.getComments());
        verification.setDigitalConfirmation(request.getDigitalConfirmation());
        verification.setDecisionDate(OffsetDateTime.now());
        
        clientVerificationRepository.save(verification);
        
        notifyDecisionRecipient(verification, "CONFIRM", "Client Verification Confirmed", "The client has confirmed the verification request.");
        
        return mapToDTO(verification);
    }

    @Transactional
    public ClientVerificationDTO requestChanges(String token, ClientDecisionRequest request) {
        if (request.getComments() == null || request.getComments().isBlank()) {
            throw new IllegalArgumentException("Comments are required to request changes");
        }
        String tokenHash = hashToken(token);
        ClientVerification verification = clientVerificationRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired verification link"));

        if (verification.getStatus() != ClientVerificationStatus.PENDING) {
            throw new IllegalArgumentException("This verification request has already been processed.");
        }
        if (verification.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new IllegalArgumentException("Verification link has expired");
        }

        ProjectBrief brief = projectBriefRepository.findById(verification.getProjectBrief().getId()).orElseThrow();
        transitionService.requestChangesClient(brief, request.getVerifierName(), request.getComments());

        verification.setStatus(ClientVerificationStatus.CHANGES_REQUESTED);
        verification.setVerifierName(request.getVerifierName());
        verification.setVerifierEmail(request.getVerifierEmail());
        verification.setRequestedChanges(request.getComments());
        verification.setDigitalConfirmation(request.getDigitalConfirmation());
        verification.setDecisionDate(OffsetDateTime.now());
        
        clientVerificationRepository.save(verification);
        
        notifyDecisionRecipient(verification, "REQUEST_CHANGES", "Client Requested Changes", "The client has requested changes during verification.");
        
        return mapToDTO(verification);
    }

    @Transactional
    public ClientVerificationDTO rejectVerification(String token, ClientDecisionRequest request) {
        if (request.getComments() == null || request.getComments().isBlank()) {
            throw new IllegalArgumentException("Comments are required to reject");
        }
        String tokenHash = hashToken(token);
        ClientVerification verification = clientVerificationRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired verification link"));

        if (verification.getStatus() != ClientVerificationStatus.PENDING) {
            throw new IllegalArgumentException("This verification request has already been processed.");
        }
        if (verification.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new IllegalArgumentException("Verification link has expired");
        }

        ProjectBrief brief = projectBriefRepository.findById(verification.getProjectBrief().getId()).orElseThrow();
        transitionService.rejectClientVerification(brief, request.getVerifierName(), request.getComments());

        verification.setStatus(ClientVerificationStatus.REJECTED);
        verification.setVerifierName(request.getVerifierName());
        verification.setVerifierEmail(request.getVerifierEmail());
        verification.setClientComments(request.getComments());
        verification.setDigitalConfirmation(request.getDigitalConfirmation());
        verification.setDecisionDate(OffsetDateTime.now());
        
        clientVerificationRepository.save(verification);
        
        notifyDecisionRecipient(verification, "REJECT", "Client Verification Rejected", "The client has rejected the verification request.");
        
        return mapToDTO(verification);
    }

    @PreAuthorize("hasAuthority('CLIENT_VERIFICATION_READ')")
    public List<ClientVerificationDTO> getVerificationsForOpportunity(UUID opportunityId) {
        return clientVerificationRepository.findByOpportunityIdOrderByCreatedAtDesc(opportunityId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private void notifyDecisionRecipient(ClientVerification verification, String decision, String title, String message) {
        ProjectBrief brief = verification.getProjectBrief();
        com.knoweb.salesmanagement.opportunity.entity.SalesOpportunity opp = brief.getOpportunity();
        User recipient = null;

        if (opp.getAssignedSalesOfficer() != null && opp.getAssignedSalesOfficer().getUser() != null) {
            recipient = opp.getAssignedSalesOfficer().getUser();
        } else if (brief.getSubmittedBy() != null) {
            recipient = brief.getSubmittedBy();
        }

        if (recipient == null) {
            log.warn("Cannot send CLIENT_VERIFICATION notification. No valid recipient found for verification ID: {} and opportunity ID: {}", 
                verification.getId(), opp.getId());
            return;
        }

        String dedupKey = "CLIENT_VERIFICATION:" + verification.getId() + ":" + decision + ":" + recipient.getId();

        notificationService.createNotification(
                recipient,
                "CLIENT_VERIFICATION",
                title,
                message,
                "PROJECT_BRIEF",
                brief.getId(),
                dedupKey
        );
    }

    private ClientVerificationDTO mapToDTO(ClientVerification entity) {
        ClientVerificationDTO dto = new ClientVerificationDTO();
        dto.setId(entity.getId());
        dto.setOpportunityId(entity.getOpportunity().getId());
        dto.setProjectBriefId(entity.getProjectBrief().getId());
        dto.setProjectBriefVersionNumber(entity.getProjectBriefVersionNumber());
        dto.setStatus(entity.getStatus());
        dto.setVerifierName(entity.getVerifierName());
        dto.setVerifierEmail(entity.getVerifierEmail());
        dto.setClientComments(entity.getClientComments());
        dto.setRequestedChanges(entity.getRequestedChanges());
        dto.setDigitalConfirmation(entity.getDigitalConfirmation());
        dto.setExpiresAt(entity.getExpiresAt());
        dto.setDecisionDate(entity.getDecisionDate());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
