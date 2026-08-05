package com.knoweb.salesmanagement.technicalproject;

import com.knoweb.salesmanagement.approval.entity.BdmApproval;
import com.knoweb.salesmanagement.approval.entity.ClientVerification;
import com.knoweb.salesmanagement.approval.enums.BdmApprovalStatus;
import com.knoweb.salesmanagement.approval.enums.ClientVerificationStatus;
import com.knoweb.salesmanagement.approval.repository.BdmApprovalRepository;
import com.knoweb.salesmanagement.approval.repository.ClientVerificationRepository;
import com.knoweb.salesmanagement.opportunity.entity.SalesOpportunity;
import com.knoweb.salesmanagement.opportunity.enums.OpportunityStage;
import com.knoweb.salesmanagement.opportunity.repository.SalesOpportunityRepository;
import com.knoweb.salesmanagement.projectbrief.entity.ProjectBrief;
import com.knoweb.salesmanagement.projectbrief.enums.ProjectBriefStatus;
import com.knoweb.salesmanagement.projectbrief.repository.ProjectBriefRepository;
import com.knoweb.salesmanagement.technicalproject.entity.TechnicalProject;
import com.knoweb.salesmanagement.technicalproject.repository.TechnicalProjectRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.Optional;

@SpringBootTest
public class TechnicalProjectEligibilityDiagnosticTest {

    @Autowired
    private SalesOpportunityRepository opportunityRepository;

    @Autowired
    private ProjectBriefRepository projectBriefRepository;

    @Autowired
    private ClientVerificationRepository clientVerificationRepository;

    @Autowired
    private BdmApprovalRepository bdmApprovalRepository;

    @Autowired
    private TechnicalProjectRepository technicalProjectRepository;

    @Test
    public void diagnoseEligibleBriefs() {
        System.out.println("==================================================");
        System.out.println("DIAGNOSING ELIGIBLE PROJECT BRIEFS");
        System.out.println("==================================================");

        List<SalesOpportunity> routingOpps = opportunityRepository.findAll().stream()
                .filter(o -> OpportunityStage.READY_FOR_TECHNICAL_ROUTING.equals(o.getStage()))
                .toList();
        System.out.println("Found " + routingOpps.size() + " opportunities in READY_FOR_TECHNICAL_ROUTING stage.");

        for (SalesOpportunity opp : routingOpps) {
            System.out.println("\nOPPORTUNITY: " + opp.getTitle() + " (" + opp.getOpportunityNumber() + ")");
            
            Optional<ProjectBrief> pbOpt = projectBriefRepository.findByOpportunityId(opp.getId());
            if (pbOpt.isEmpty()) {
                System.out.println("REJECTION REASON: PROJECT_BRIEF_MISSING");
                continue;
            }

            ProjectBrief pb = pbOpt.get();
            System.out.println("  - Project Brief found. Current Version: " + pb.getCurrentVersionNumber() + ", Status: " + pb.getStatus());

            List<ProjectBriefStatus> invalidStatuses = List.of(
                ProjectBriefStatus.DRAFT,
                ProjectBriefStatus.SUBMITTED,
                ProjectBriefStatus.BDM_RETURNED_FOR_REVISION,
                ProjectBriefStatus.BDM_INFORMATION_REQUESTED,
                ProjectBriefStatus.BDM_REJECTED,
                ProjectBriefStatus.CLIENT_CHANGES_REQUESTED,
                ProjectBriefStatus.CLIENT_REJECTED
            );

            if (invalidStatuses.contains(pb.getStatus())) {
                System.out.println("  - INVALID STATUS. Status " + pb.getStatus() + " is in invalidStatuses list.");
            }

            Optional<TechnicalProject> tpOpt = technicalProjectRepository.findByProjectBriefId(pb.getId());
            if (tpOpt.isPresent()) {
                System.out.println("REJECTION REASON: TECHNICAL_PROJECT_ALREADY_EXISTS");
                continue;
            }

            // Check Verification
            Optional<ClientVerification> cvOpt = clientVerificationRepository.findByProjectBriefIdOrderByCreatedAtDesc(pb.getId()).stream()
                .filter(cv -> cv.getStatus() == ClientVerificationStatus.CONFIRMED)
                .findFirst();

            List<ClientVerification> allVerifications = clientVerificationRepository.findByProjectBriefIdOrderByCreatedAtDesc(pb.getId());
            System.out.println("  - Total Client Verifications for PB: " + allVerifications.size());
            for (ClientVerification cv : allVerifications) {
                System.out.println("    -> CV version: " + cv.getProjectBriefVersionNumber() + ", Status: " + cv.getStatus());
            }

            if (cvOpt.isEmpty()) {
                System.out.println("REJECTION REASON: CLIENT_VERIFICATION_NOT_CONFIRMED (No CONFIRMED record found)");
                continue;
            }

            // Check Bdm Approval
            Optional<BdmApproval> baOpt = bdmApprovalRepository.findAll().stream()
                .filter(a -> a.getProjectBrief().getId().equals(pb.getId()) && a.getStatus() == BdmApprovalStatus.APPROVED)
                .findFirst();

            List<BdmApproval> allApprovals = bdmApprovalRepository.findAll().stream()
                    .filter(a -> a.getProjectBrief().getId().equals(pb.getId()))
                    .toList();
            System.out.println("  - Total BDM Approvals for PB: " + allApprovals.size());
            for (BdmApproval ba : allApprovals) {
                System.out.println("    -> BA version: " + ba.getProjectBriefVersionNumber() + ", Status: " + ba.getStatus());
            }

            if (baOpt.isEmpty()) {
                System.out.println("REJECTION REASON: BDM_APPROVAL_NOT_APPROVED (Looking for APPROVED at version " + pb.getCurrentVersionNumber() + ")");
                continue;
            }

            System.out.println("  -> THIS PROJECT BRIEF IS ELIGIBLE.");
        }
        System.out.println("==================================================");
    }
}
