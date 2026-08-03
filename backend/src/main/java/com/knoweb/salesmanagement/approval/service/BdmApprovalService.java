package com.knoweb.salesmanagement.approval.service;

import com.knoweb.salesmanagement.approval.dto.BdmApprovalCommentDTO;
import com.knoweb.salesmanagement.approval.dto.BdmApprovalDTO;
import com.knoweb.salesmanagement.approval.dto.BdmDecisionRequest;
import com.knoweb.salesmanagement.approval.entity.BdmApproval;
import com.knoweb.salesmanagement.approval.entity.BdmApprovalComment;
import com.knoweb.salesmanagement.approval.enums.BdmApprovalStatus;
import com.knoweb.salesmanagement.approval.repository.BdmApprovalCommentRepository;
import com.knoweb.salesmanagement.approval.repository.BdmApprovalRepository;
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

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BdmApprovalService {
    private static final Logger log = LoggerFactory.getLogger(BdmApprovalService.class);
    private final BdmApprovalRepository bdmApprovalRepository;
    private final BdmApprovalCommentRepository bdmApprovalCommentRepository;
    private final ProjectBriefRepository projectBriefRepository;
    private final UserRepository userRepository;
    private final WorkflowTransitionService transitionService;
    private final NotificationService notificationService;

    public BdmApprovalService(BdmApprovalRepository bdmApprovalRepository,
                              BdmApprovalCommentRepository bdmApprovalCommentRepository,
                              ProjectBriefRepository projectBriefRepository,
                              UserRepository userRepository,
                              WorkflowTransitionService transitionService,
                              NotificationService notificationService) {
        this.bdmApprovalRepository = bdmApprovalRepository;
        this.bdmApprovalCommentRepository = bdmApprovalCommentRepository;
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

    @Transactional
    public void ensurePendingApprovalExists(ProjectBrief brief) {
        bdmApprovalRepository.findByProjectBriefIdAndProjectBriefVersionNumberAndStatus(
                brief.getId(), brief.getCurrentVersionNumber(), BdmApprovalStatus.PENDING
        ).orElseGet(() -> {
            BdmApproval approval = new BdmApproval();
            approval.setOpportunity(brief.getOpportunity());
            approval.setProjectBrief(brief);
            approval.setProjectBriefVersionNumber(brief.getCurrentVersionNumber());
            approval.setStatus(BdmApprovalStatus.PENDING);
            return bdmApprovalRepository.save(approval);
        });
    }

    @PreAuthorize("hasAuthority('BDM_APPROVAL_READ')")
    @Transactional(readOnly = true)
    public List<BdmApprovalDTO> getApprovalsForOpportunity(UUID opportunityId) {
        return bdmApprovalRepository.findByOpportunityIdOrderByCreatedAtDesc(opportunityId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @PreAuthorize("hasAuthority('BDM_APPROVAL_READ')")
    @Transactional(readOnly = true)
    public List<BdmApprovalDTO> getPendingApprovals() {
        return bdmApprovalRepository.findByStatusOrderByCreatedAtDesc(BdmApprovalStatus.PENDING).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @PreAuthorize("hasAuthority('BDM_APPROVAL_READ')")
    @Transactional(readOnly = true)
    public BdmApprovalDTO getApprovalById(UUID id) {
        BdmApproval approval = bdmApprovalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Approval not found"));
        return mapToDTO(approval);
    }

    @PreAuthorize("hasAuthority('BDM_APPROVAL_DECIDE')")
    @Transactional
    public BdmApprovalDTO approve(UUID briefId, BdmDecisionRequest request) {
        ProjectBrief brief = projectBriefRepository.findById(briefId)
                .orElseThrow(() -> new ResourceNotFoundException("Brief not found"));
        
        ensurePendingApprovalExists(brief);
        BdmApproval approval = getPendingApproval(brief);
        
        User user = getAuthenticatedUser();
        transitionService.approveBdmReview(brief, user, request.getComments());

        approval.setStatus(BdmApprovalStatus.APPROVED);
        approval.setDecisionMaker(user);
        approval.setDecisionDate(OffsetDateTime.now());
        bdmApprovalRepository.save(approval);

        if (request.getComments() != null && !request.getComments().isBlank()) {
            addComment(approval, user, request.getComments());
        }

        notifyDecisionRecipient(approval, "APPROVE", "Project Brief Approved", "Your project brief has been approved by BDM.");
        
        return mapToDTO(approval);
    }

    @PreAuthorize("hasAuthority('BDM_APPROVAL_DECIDE')")
    @Transactional
    public BdmApprovalDTO reject(UUID briefId, BdmDecisionRequest request) {
        if (request.getComments() == null || request.getComments().isBlank()) {
            throw new IllegalArgumentException("Comments are required for rejection");
        }
        ProjectBrief brief = projectBriefRepository.findById(briefId).orElseThrow();
        ensurePendingApprovalExists(brief);
        BdmApproval approval = getPendingApproval(brief);
        User user = getAuthenticatedUser();
        
        transitionService.rejectBdmReview(brief, user, request.getComments());

        approval.setStatus(BdmApprovalStatus.REJECTED);
        approval.setDecisionMaker(user);
        approval.setDecisionDate(OffsetDateTime.now());
        bdmApprovalRepository.save(approval);
        addComment(approval, user, request.getComments());
        
        notifyDecisionRecipient(approval, "REJECT", "Project Brief Rejected", "Your project brief has been rejected by BDM.");
        
        return mapToDTO(approval);
    }

    @PreAuthorize("hasAuthority('BDM_APPROVAL_DECIDE')")
    @Transactional
    public BdmApprovalDTO returnForRevision(UUID briefId, BdmDecisionRequest request) {
        if (request.getComments() == null || request.getComments().isBlank()) {
            throw new IllegalArgumentException("Comments are required to return for revision");
        }
        ProjectBrief brief = projectBriefRepository.findById(briefId).orElseThrow();
        ensurePendingApprovalExists(brief);
        BdmApproval approval = getPendingApproval(brief);
        User user = getAuthenticatedUser();
        
        transitionService.returnBdmReview(brief, user, request.getComments());

        approval.setStatus(BdmApprovalStatus.RETURNED_FOR_REVISION);
        approval.setDecisionMaker(user);
        approval.setDecisionDate(OffsetDateTime.now());
        bdmApprovalRepository.save(approval);
        addComment(approval, user, request.getComments());
        
        notifyDecisionRecipient(approval, "RETURN_FOR_REVISION", "Project Brief Returned for Revision", "Your project brief has been returned for revision by BDM.");
        
        return mapToDTO(approval);
    }

    @PreAuthorize("hasAuthority('BDM_APPROVAL_DECIDE')")
    @Transactional
    public BdmApprovalDTO requestInformation(UUID briefId, BdmDecisionRequest request) {
        if (request.getComments() == null || request.getComments().isBlank()) {
            throw new IllegalArgumentException("Comments are required to request information");
        }
        ProjectBrief brief = projectBriefRepository.findById(briefId).orElseThrow();
        ensurePendingApprovalExists(brief);
        BdmApproval approval = getPendingApproval(brief);
        User user = getAuthenticatedUser();
        
        transitionService.requestInformationBdm(brief, user, request.getComments());

        approval.setStatus(BdmApprovalStatus.INFORMATION_REQUESTED);
        approval.setDecisionMaker(user);
        approval.setDecisionDate(OffsetDateTime.now());
        bdmApprovalRepository.save(approval);
        addComment(approval, user, request.getComments());
        
        notifyDecisionRecipient(approval, "REQUEST_INFORMATION", "Information Requested for Project Brief", "Additional information has been requested for your project brief by BDM.");
        
        return mapToDTO(approval);
    }

    private BdmApproval getPendingApproval(ProjectBrief brief) {
        return bdmApprovalRepository.findByProjectBriefIdAndProjectBriefVersionNumberAndStatus(
                brief.getId(), brief.getCurrentVersionNumber(), BdmApprovalStatus.PENDING
        ).orElseThrow(() -> new ResourceNotFoundException("No pending approval found for this version"));
    }

    private void addComment(BdmApproval approval, User user, String comment) {
        BdmApprovalComment ac = new BdmApprovalComment();
        ac.setBdmApproval(approval);
        ac.setComment(comment);
        ac.setCreatedBy(user);
        bdmApprovalCommentRepository.save(ac);
    }

    private void notifyDecisionRecipient(BdmApproval approval, String decision, String title, String message) {
        ProjectBrief brief = approval.getProjectBrief();
        com.knoweb.salesmanagement.opportunity.entity.SalesOpportunity opp = brief.getOpportunity();
        User recipient = null;

        if (opp.getAssignedSalesOfficer() != null && opp.getAssignedSalesOfficer().getUser() != null) {
            recipient = opp.getAssignedSalesOfficer().getUser();
        } else if (brief.getSubmittedBy() != null) {
            recipient = brief.getSubmittedBy();
        }

        if (recipient == null) {
            log.warn("Cannot send BDM_DECISION notification. No valid recipient found for approval ID: {} and opportunity ID: {}", 
                approval.getId(), opp.getId());
            return;
        }

        String dedupKey = "BDM_DECISION:" + approval.getId() + ":" + decision + ":" + recipient.getId();

        notificationService.createNotification(
                recipient,
                "BDM_DECISION",
                title,
                message,
                "PROJECT_BRIEF",
                brief.getId(),
                dedupKey
        );
    }

    private BdmApprovalDTO mapToDTO(BdmApproval entity) {
        BdmApprovalDTO dto = new BdmApprovalDTO();
        dto.setId(entity.getId());
        dto.setOpportunityId(entity.getOpportunity().getId());
        dto.setProjectBriefId(entity.getProjectBrief().getId());
        dto.setProjectBriefVersionNumber(entity.getProjectBriefVersionNumber());
        dto.setStatus(entity.getStatus());
        dto.setDecisionDate(entity.getDecisionDate());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setOpportunityNumber(entity.getOpportunity().getOpportunityNumber());
        dto.setOpportunityTitle(entity.getOpportunity().getTitle());
        dto.setClientName(entity.getOpportunity().getClient() != null ? entity.getOpportunity().getClient().getName() : null);
        if (entity.getOpportunity().getAssignedSalesOfficer() != null) {
            dto.setAssignedSalesOfficerId(entity.getOpportunity().getAssignedSalesOfficer().getId());
            dto.setAssignedSalesOfficerName(getSafeEmployeeDisplayName(entity.getOpportunity().getAssignedSalesOfficer()));
        } else {
            dto.setAssignedSalesOfficerName("Unassigned");
        }
        if (entity.getDecisionMaker() != null) {
            dto.setDecisionMakerId(entity.getDecisionMaker().getId());
            dto.setDecisionMakerName(entity.getDecisionMaker().getFirstName() + " " + entity.getDecisionMaker().getLastName());
        }
        List<BdmApprovalCommentDTO> comments = bdmApprovalCommentRepository.findByBdmApprovalIdOrderByCreatedAtAsc(entity.getId())
                .stream().map(c -> {
                    BdmApprovalCommentDTO cd = new BdmApprovalCommentDTO();
                    cd.setId(c.getId());
                    cd.setComment(c.getComment());
                    cd.setCreatedById(c.getCreatedBy().getId());
                    cd.setCreatedByName(c.getCreatedBy().getFirstName() + " " + c.getCreatedBy().getLastName());
                    cd.setCreatedAt(c.getCreatedAt());
                    return cd;
                }).collect(Collectors.toList());
        dto.setComments(comments);
        return dto;
    }

    private String getSafeEmployeeDisplayName(com.knoweb.salesmanagement.employee.entity.Employee employee) {
        if (employee == null) {
            return "Unassigned";
        }
        User user = employee.getUser();
        if (user == null) {
            return "Unassigned";
        }
        String firstName = user.getFirstName() != null ? user.getFirstName() : "";
        String lastName = user.getLastName() != null ? user.getLastName() : "";
        String fullName = (firstName + " " + lastName).trim();
        return fullName.isEmpty() ? "Unassigned" : fullName;
    }
}
