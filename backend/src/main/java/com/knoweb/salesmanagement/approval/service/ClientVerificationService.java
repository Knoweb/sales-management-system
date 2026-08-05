package com.knoweb.salesmanagement.approval.service;

import com.knoweb.salesmanagement.approval.dto.ClientDecisionRequest;
import com.knoweb.salesmanagement.approval.dto.ClientVerificationDTO;
import com.knoweb.salesmanagement.approval.entity.ClientVerification;
import com.knoweb.salesmanagement.approval.enums.ClientVerificationStatus;
import com.knoweb.salesmanagement.approval.repository.ClientVerificationRepository;
import com.knoweb.salesmanagement.common.exception.ResourceNotFoundException;
import com.knoweb.salesmanagement.projectbrief.entity.ProjectBrief;
import com.knoweb.salesmanagement.projectbrief.repository.ProjectBriefRepository;
import com.knoweb.salesmanagement.projectbrief.repository.ProjectBriefVersionRepository;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import com.knoweb.salesmanagement.notification.service.NotificationService;
import com.knoweb.salesmanagement.approval.entity.WorkflowHistory;
import com.knoweb.salesmanagement.approval.repository.BdmApprovalRepository;
import com.knoweb.salesmanagement.approval.enums.BdmApprovalStatus;
import com.knoweb.salesmanagement.approval.repository.WorkflowHistoryRepository;
import com.knoweb.salesmanagement.security.crypto.EncryptionService;
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
    private final EncryptionService encryptionService;
    private final WorkflowHistoryRepository workflowHistoryRepository;
    private final BdmApprovalRepository bdmApprovalRepository;
    private final ProjectBriefVersionRepository projectBriefVersionRepository;

    public ClientVerificationService(ClientVerificationRepository clientVerificationRepository,
                                     ProjectBriefRepository projectBriefRepository,
                                     UserRepository userRepository,
                                     WorkflowTransitionService transitionService,
                                     NotificationService notificationService,
                                     EncryptionService encryptionService,
                                     WorkflowHistoryRepository workflowHistoryRepository,
                                     BdmApprovalRepository bdmApprovalRepository,
                                     ProjectBriefVersionRepository projectBriefVersionRepository) {
        this.clientVerificationRepository = clientVerificationRepository;
        this.projectBriefRepository = projectBriefRepository;
        this.userRepository = userRepository;
        this.transitionService = transitionService;
        this.notificationService = notificationService;
        this.encryptionService = encryptionService;
        this.workflowHistoryRepository = workflowHistoryRepository;
        this.bdmApprovalRepository = bdmApprovalRepository;
        this.projectBriefVersionRepository = projectBriefVersionRepository;
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
        
        List<com.knoweb.salesmanagement.approval.entity.BdmApproval> approvals = bdmApprovalRepository.findByOpportunityIdOrderByCreatedAtDesc(brief.getOpportunity().getId());
        com.knoweb.salesmanagement.approval.entity.BdmApproval latestApproval = approvals.stream()
            .filter(a -> a.getProjectBrief().getId().equals(brief.getId()))
            .findFirst()
            .orElseThrow(() -> new com.knoweb.salesmanagement.common.exception.ResourceConflictException("No BDM approval found for this brief."));
            
        if (latestApproval.getStatus() != BdmApprovalStatus.APPROVED) {
            throw new com.knoweb.salesmanagement.common.exception.ResourceConflictException("Cannot create client verification. Exact brief version must be BDM_APPROVED.");
        }
        
        List<ClientVerification> existingList = clientVerificationRepository.findByProjectBriefIdOrderByCreatedAtDesc(brief.getId());
        for (ClientVerification existing : existingList) {
            if (existing.getStatus() == ClientVerificationStatus.CONFIRMED) {
                throw new com.knoweb.salesmanagement.common.exception.ResourceConflictException("A confirmed client verification already exists for this Project Brief.");
            }
            if (existing.getStatus() == ClientVerificationStatus.PENDING && (existing.getExpiresAt() == null || existing.getExpiresAt().isAfter(OffsetDateTime.now()))) {
                throw new com.knoweb.salesmanagement.common.exception.ResourceConflictException("An active verification link already exists for this Project Brief. Please regenerate or copy the existing link.");
            }
            if (existing.getStatus() == ClientVerificationStatus.PENDING && existing.getExpiresAt() != null && existing.getExpiresAt().isBefore(OffsetDateTime.now())) {
                existing.setStatus(ClientVerificationStatus.EXPIRED);
                clientVerificationRepository.save(existing);
            }
        }
        
        transitionService.createClientVerification(brief, user);

        String plainToken = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
        String tokenHash = hashToken(plainToken);

        ClientVerification verification = new ClientVerification();
        verification.setOpportunity(brief.getOpportunity());
        verification.setProjectBrief(brief);
        verification.setProjectBriefVersionNumber(brief.getCurrentVersionNumber());
        verification.setTokenHash(tokenHash);
        verification.setEncryptedToken(encryptionService.encrypt(plainToken));
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
                
        if (verification.getStatus() == ClientVerificationStatus.PENDING && verification.getExpiresAt() != null && verification.getExpiresAt().isBefore(OffsetDateTime.now())) {
            verification.setStatus(ClientVerificationStatus.EXPIRED);
            clientVerificationRepository.save(verification);
        }
        
        return mapToDTO(verification);
    }

    @PreAuthorize("hasAuthority('CLIENT_VERIFICATION_CREATE') or hasAuthority('CLIENT_VERIFICATION_READ_LINK')")
    @Transactional
    public String regenerateVerificationLink(UUID id) {
        ClientVerification verification = clientVerificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Verification not found"));
        
        if (verification.getStatus() == ClientVerificationStatus.CONFIRMED) {
            throw new IllegalArgumentException("Cannot regenerate a CONFIRMED verification");
        }
        
        User user = getAuthenticatedUser();
        String previousState = verification.getStatus().name();
        
        if (verification.getStatus() == ClientVerificationStatus.PENDING) {
            verification.setStatus(ClientVerificationStatus.REVOKED);
            verification.setDecisionDate(OffsetDateTime.now());
            clientVerificationRepository.save(verification);
        }

        List<ClientVerification> existingList = clientVerificationRepository.findByProjectBriefIdOrderByCreatedAtDesc(verification.getProjectBrief().getId());
        for (ClientVerification existing : existingList) {
            if (existing.getStatus() == ClientVerificationStatus.PENDING) {
                existing.setStatus(ClientVerificationStatus.REVOKED);
                existing.setDecisionDate(OffsetDateTime.now());
                clientVerificationRepository.save(existing);
            }
        }
        
        String plainToken = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
        String tokenHash = hashToken(plainToken);
        
        ClientVerification newVerification = new ClientVerification();
        newVerification.setOpportunity(verification.getOpportunity());
        newVerification.setProjectBrief(verification.getProjectBrief());
        newVerification.setProjectBriefVersionNumber(verification.getProjectBriefVersionNumber());
        newVerification.setTokenHash(tokenHash);
        newVerification.setEncryptedToken(encryptionService.encrypt(plainToken));
        newVerification.setStatus(ClientVerificationStatus.PENDING);
        newVerification.setExpiresAt(OffsetDateTime.now().plusDays(7));
        newVerification.setVerifierName(verification.getVerifierName());
        newVerification.setVerifierEmail(verification.getVerifierEmail());
        newVerification.setCreatedBy(user);
        
        clientVerificationRepository.save(newVerification);
        
        WorkflowHistory history = new WorkflowHistory();
        history.setOpportunity(verification.getOpportunity());
        history.setProjectBrief(verification.getProjectBrief());
        history.setProjectBriefVersionNumber(verification.getProjectBriefVersionNumber());
        history.setActor(user);
        if (user != null) {
            history.setActorName(user.getFirstName() + " " + user.getLastName());
        }
        history.setAction("REGENERATE_VERIFICATION_LINK");
        history.setPreviousState(previousState);
        history.setNewState("PENDING");
        history.setComments("Revoked previous verification link and generated a new client verification link.");
        workflowHistoryRepository.save(history);
        
        return plainToken;
    }

    @PreAuthorize("hasAuthority('CLIENT_VERIFICATION_CREATE') or hasAuthority('CLIENT_VERIFICATION_READ_LINK')")
    @Transactional
    public String getVerificationLink(UUID id) {
        ClientVerification verification = clientVerificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Verification not found"));
        
        if (verification.getStatus() != ClientVerificationStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING verifications have an active link");
        }
        if (verification.getExpiresAt() != null && verification.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new IllegalArgumentException("Verification link has expired");
        }
        if (verification.getEncryptedToken() == null || verification.getEncryptedToken().isBlank()) {
            throw new IllegalArgumentException("Verification link token is not recoverable; only hash was stored. Please regenerate the verification link.");
        }
        
        String plainToken = encryptionService.decrypt(verification.getEncryptedToken());
        User user = getAuthenticatedUser();
        
        WorkflowHistory history = new WorkflowHistory();
        history.setOpportunity(verification.getOpportunity());
        history.setProjectBrief(verification.getProjectBrief());
        history.setProjectBriefVersionNumber(verification.getProjectBriefVersionNumber());
        history.setActor(user);
        if (user != null) {
            history.setActorName(user.getFirstName() + " " + user.getLastName());
        }
        history.setAction("VIEW_VERIFICATION_LINK");
        history.setPreviousState(verification.getStatus().name());
        history.setNewState(verification.getStatus().name());
        history.setComments("User viewed or copied the active verification link.");
        workflowHistoryRepository.save(history);
        
        return plainToken;
    }

    @PreAuthorize("hasAuthority('CLIENT_VERIFICATION_CREATE')")
    @Transactional
    public void revokeVerificationLink(UUID id) {
        ClientVerification verification = clientVerificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Verification not found"));
        
        if (verification.getStatus() != ClientVerificationStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING verifications can be revoked");
        }
        
        verification.setStatus(ClientVerificationStatus.REVOKED);
        verification.setDecisionDate(OffsetDateTime.now());
        
        clientVerificationRepository.save(verification);
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
        if (entity.getStatus() == ClientVerificationStatus.PENDING && entity.getExpiresAt() != null && entity.getExpiresAt().isBefore(OffsetDateTime.now())) {
            entity.setStatus(ClientVerificationStatus.EXPIRED);
        }
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
        dto.setRecoverable(entity.getEncryptedToken() != null && !entity.getEncryptedToken().isBlank() && entity.getStatus() == ClientVerificationStatus.PENDING && entity.getExpiresAt() != null && !entity.getExpiresAt().isBefore(OffsetDateTime.now()));

        // Prefer the exact version snapshot; fall back to the most recently submitted version for the same brief
        boolean snapshotSet = false;
        if (entity.getProjectBriefVersionNumber() != null) {
            java.util.Optional<com.knoweb.salesmanagement.projectbrief.entity.ProjectBriefVersion> versionOpt =
                projectBriefVersionRepository.findByProjectBriefIdAndVersionNumber(
                    entity.getProjectBrief().getId(),
                    entity.getProjectBriefVersionNumber()
                );
            if (versionOpt.isPresent()) {
                dto.setProjectBriefSnapshot(versionOpt.get().getSnapshot());
                snapshotSet = true;
            }
        }
        if (!snapshotSet) {
            // Fall back: use the most recently submitted version for this brief
            projectBriefVersionRepository
                .findByProjectBriefIdOrderByVersionNumberDesc(entity.getProjectBrief().getId())
                .stream()
                .filter(v -> v.isSubmittedVersion() && v.getSnapshot() != null)
                .findFirst()
                .ifPresent(v -> dto.setProjectBriefSnapshot(v.getSnapshot()));
        }
        return dto;
    }
}
