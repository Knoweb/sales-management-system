package com.knoweb.salesmanagement.config;

import com.knoweb.salesmanagement.approval.entity.BdmApproval;
import com.knoweb.salesmanagement.approval.enums.BdmApprovalStatus;
import com.knoweb.salesmanagement.approval.repository.BdmApprovalRepository;
import com.knoweb.salesmanagement.projectbrief.entity.ProjectBriefVersion;
import com.knoweb.salesmanagement.projectbrief.repository.ProjectBriefVersionRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import org.springframework.context.annotation.Profile;

@Component
@Profile("!test")
public class FixMissingBdmApprovals implements ApplicationRunner {

    private final ProjectBriefVersionRepository projectBriefVersionRepository;
    private final BdmApprovalRepository bdmApprovalRepository;

    public FixMissingBdmApprovals(ProjectBriefVersionRepository projectBriefVersionRepository, BdmApprovalRepository bdmApprovalRepository) {
        this.projectBriefVersionRepository = projectBriefVersionRepository;
        this.bdmApprovalRepository = bdmApprovalRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        List<ProjectBriefVersion> submittedVersions = projectBriefVersionRepository.findBySubmittedVersionTrue();
        
        for (ProjectBriefVersion version : submittedVersions) {
            boolean exists = bdmApprovalRepository.findByProjectBriefIdAndProjectBriefVersionNumberAndStatus(
                    version.getProjectBrief().getId(), 
                    version.getVersionNumber(), 
                    BdmApprovalStatus.PENDING
            ).isPresent();

            boolean approvedExists = bdmApprovalRepository.findByProjectBriefIdAndProjectBriefVersionNumberAndStatus(
                    version.getProjectBrief().getId(), 
                    version.getVersionNumber(), 
                    BdmApprovalStatus.APPROVED
            ).isPresent();
            
            boolean rejectedExists = bdmApprovalRepository.findByProjectBriefIdAndProjectBriefVersionNumberAndStatus(
                    version.getProjectBrief().getId(), 
                    version.getVersionNumber(), 
                    BdmApprovalStatus.REJECTED
            ).isPresent();

            if (!exists && !approvedExists && !rejectedExists) {
                // Determine if we should create a pending one based on the Project Brief's current status
                String status = version.getProjectBrief().getStatus().name();
                if (status.equals("AWAITING_BDM_REVIEW") || status.equals("PENDING") || status.equals("SUBMITTED")) { // Assuming project uses AWAITING_BDM_REVIEW or similar
                    System.out.println("Repairing missing BDM Approval request for Brief ID: " + version.getProjectBrief().getId());
                    BdmApproval approval = new BdmApproval();
                    approval.setOpportunity(version.getProjectBrief().getOpportunity());
                    approval.setProjectBrief(version.getProjectBrief());
                    approval.setProjectBriefVersionNumber(version.getVersionNumber());
                    approval.setStatus(BdmApprovalStatus.PENDING);
                    bdmApprovalRepository.save(approval);
                }
            }
        }
    }
}
