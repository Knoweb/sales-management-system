package com.knoweb.salesmanagement.technicalproject.service;

import com.knoweb.salesmanagement.approval.entity.BdmApproval;
import com.knoweb.salesmanagement.approval.entity.ClientVerification;
import com.knoweb.salesmanagement.approval.enums.BdmApprovalStatus;
import com.knoweb.salesmanagement.approval.enums.ClientVerificationStatus;
import com.knoweb.salesmanagement.approval.repository.BdmApprovalRepository;
import com.knoweb.salesmanagement.approval.repository.ClientVerificationRepository;
import com.knoweb.salesmanagement.projectbrief.entity.ProjectBrief;
import com.knoweb.salesmanagement.projectbrief.enums.ProjectBriefStatus;
import com.knoweb.salesmanagement.projectbrief.repository.ProjectBriefRepository;
import com.knoweb.salesmanagement.technicalproject.dto.TechnicalProjectEligibilityDTO;
import com.knoweb.salesmanagement.technicalproject.enums.TechnicalProjectEligibilityReason;
import com.knoweb.salesmanagement.technicalproject.repository.TechnicalProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TechnicalProjectEligibilityService {

    private final ProjectBriefRepository projectBriefRepository;
    private final ClientVerificationRepository clientVerificationRepository;
    private final BdmApprovalRepository bdmApprovalRepository;
    private final TechnicalProjectRepository technicalProjectRepository;

    public TechnicalProjectEligibilityService(ProjectBriefRepository projectBriefRepository,
                                              ClientVerificationRepository clientVerificationRepository,
                                              BdmApprovalRepository bdmApprovalRepository,
                                              TechnicalProjectRepository technicalProjectRepository) {
        this.projectBriefRepository = projectBriefRepository;
        this.clientVerificationRepository = clientVerificationRepository;
        this.bdmApprovalRepository = bdmApprovalRepository;
        this.technicalProjectRepository = technicalProjectRepository;
    }

    @Transactional(readOnly = true)
    public TechnicalProjectEligibilityDTO checkEligibility(UUID projectBriefId) {
        TechnicalProjectEligibilityDTO result = new TechnicalProjectEligibilityDTO();
        result.setProjectBriefId(projectBriefId);
        result.setEligible(false);

        Optional<ProjectBrief> briefOpt = projectBriefRepository.findById(projectBriefId);
        if (briefOpt.isEmpty()) {
            return setReason(result, TechnicalProjectEligibilityReason.PROJECT_BRIEF_NOT_FOUND, "Project brief not found.");
        }
        
        ProjectBrief brief = briefOpt.get();
        if (brief.getOpportunity() == null) {
            return setReason(result, TechnicalProjectEligibilityReason.SALES_OPPORTUNITY_NOT_FOUND, "Sales opportunity not linked to project brief.");
        }

        if (technicalProjectRepository.existsByProjectBriefId(projectBriefId)) {
            result.setTechnicalProjectAlreadyExists(true);
            return setReason(result, TechnicalProjectEligibilityReason.TECHNICAL_PROJECT_ALREADY_EXISTS, "Technical project already exists for this brief.");
        }

        List<ProjectBriefStatus> invalidStatuses = List.of(
            ProjectBriefStatus.DRAFT,
            ProjectBriefStatus.BDM_RETURNED_FOR_REVISION,
            ProjectBriefStatus.BDM_INFORMATION_REQUESTED,
            ProjectBriefStatus.BDM_REJECTED,
            ProjectBriefStatus.CLIENT_CHANGES_REQUESTED,
            ProjectBriefStatus.CLIENT_REJECTED
        );
        if (invalidStatuses.contains(brief.getStatus())) {
            return setReason(result, TechnicalProjectEligibilityReason.INVALID_PROJECT_BRIEF_STATUS, "Project brief is in an invalid status for technical routing.");
        }

        List<ClientVerification> verifications = clientVerificationRepository.findByOpportunityIdOrderByCreatedAtDesc(brief.getOpportunity().getId());
        ClientVerification validVerification = null;
        for (ClientVerification cv : verifications) {
            if (cv.getProjectBrief().getId().equals(projectBriefId) &&
                cv.getProjectBriefVersionNumber().equals(brief.getCurrentVersionNumber())) {
                validVerification = cv;
                break;
            }
        }
        
        if (validVerification == null) {
            return setReason(result, TechnicalProjectEligibilityReason.CLIENT_VERIFICATION_REQUIRED, "Client verification is required for the current version of this project brief.");
        }
        if (validVerification.getStatus() != ClientVerificationStatus.CONFIRMED) {
            return setReason(result, TechnicalProjectEligibilityReason.CLIENT_VERIFICATION_NOT_APPROVED, "Client verification is not confirmed.");
        }
        result.setVerified(true);
        result.setClientVerificationId(validVerification.getId());

        List<BdmApproval> approvals = bdmApprovalRepository.findByOpportunityIdOrderByCreatedAtDesc(brief.getOpportunity().getId());
        BdmApproval validApproval = null;
        for (BdmApproval ba : approvals) {
            if (ba.getProjectBrief().getId().equals(projectBriefId) &&
                ba.getProjectBriefVersionNumber().equals(brief.getCurrentVersionNumber())) {
                validApproval = ba;
                break;
            }
        }

        if (validApproval == null) {
            return setReason(result, TechnicalProjectEligibilityReason.BDM_APPROVAL_REQUIRED, "BDM approval is required for the current version of this project brief.");
        }
        if (validApproval.getStatus() != BdmApprovalStatus.APPROVED) {
            return setReason(result, TechnicalProjectEligibilityReason.BDM_APPROVAL_NOT_APPROVED, "BDM approval is not approved.");
        }
        result.setBdmApproved(true);
        result.setBdmApprovalId(validApproval.getId());
        
        result.setApprovedProjectBriefVersionId(brief.getCurrentVersionNumber());
        result.setEligible(true);
        return setReason(result, TechnicalProjectEligibilityReason.ELIGIBLE, "Eligible for technical routing.");
    }

    private TechnicalProjectEligibilityDTO setReason(TechnicalProjectEligibilityDTO dto, TechnicalProjectEligibilityReason code, String message) {
        dto.setReasonCode(code);
        dto.setReason(message);
        return dto;
    }
}
