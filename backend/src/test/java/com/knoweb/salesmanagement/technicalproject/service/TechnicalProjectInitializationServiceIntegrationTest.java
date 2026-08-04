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
import com.knoweb.salesmanagement.technicalproject.entity.TechnicalProject;
import com.knoweb.salesmanagement.technicalproject.enums.TechnicalProjectEligibilityReason;
import com.knoweb.salesmanagement.technicalproject.enums.TechnicalProjectStatus;
import com.knoweb.salesmanagement.technicalproject.exception.TechnicalProjectAlreadyExistsException;
import com.knoweb.salesmanagement.technicalproject.exception.TechnicalProjectNotEligibleException;
import com.knoweb.salesmanagement.technicalproject.repository.TechnicalProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class TechnicalProjectInitializationServiceIntegrationTest {

    @Autowired private TechnicalProjectInitializationService initializationService;
    @Autowired private TechnicalProjectEligibilityService eligibilityService;
    @Autowired private ProjectBriefRepository projectBriefRepository;
    @Autowired private ClientVerificationRepository clientVerificationRepository;
    @Autowired private BdmApprovalRepository bdmApprovalRepository;
    @Autowired private TechnicalProjectRepository technicalProjectRepository;
    @Autowired private com.knoweb.salesmanagement.user.repository.UserRepository userRepository;
    @Autowired private com.knoweb.salesmanagement.client.repository.ClientRepository clientRepository;
    @Autowired private com.knoweb.salesmanagement.lead.repository.LeadRepository leadRepository;
    @Autowired private com.knoweb.salesmanagement.productcategory.repository.ProductCategoryRepository categoryRepository;
    @Autowired private com.knoweb.salesmanagement.opportunity.repository.SalesOpportunityRepository opportunityRepository;

    private ProjectBrief pb;

    @BeforeEach
    void setUp() {
        com.knoweb.salesmanagement.user.entity.User admin = new com.knoweb.salesmanagement.user.entity.User();
        admin.setEmail("admin_" + UUID.randomUUID() + "@test.com");
        admin.setFirstName("Admin");
        admin.setLastName("Test");
        admin.setPasswordHash("pass");
        admin = userRepository.save(admin);

        com.knoweb.salesmanagement.client.entity.Client client = new com.knoweb.salesmanagement.client.entity.Client();
        client.setName("Test Client Co");
        client.setClientType(com.knoweb.salesmanagement.client.enums.ClientType.COMPANY);
        client = clientRepository.save(client);

        com.knoweb.salesmanagement.lead.entity.Lead lead = new com.knoweb.salesmanagement.lead.entity.Lead();
        lead.setTitle("Test Lead");
        lead.setClient(client);
        lead.setInquirySource(com.knoweb.salesmanagement.lead.enums.InquirySource.WEBSITE);
        lead.setStatus(com.knoweb.salesmanagement.lead.enums.LeadStatus.NEW);
        lead = leadRepository.save(lead);

        com.knoweb.salesmanagement.productcategory.entity.ProductCategory category = new com.knoweb.salesmanagement.productcategory.entity.ProductCategory();
        category.setCode("CAT-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        category.setName("Category");
        category = categoryRepository.save(category);

        com.knoweb.salesmanagement.opportunity.entity.SalesOpportunity opportunity = new com.knoweb.salesmanagement.opportunity.entity.SalesOpportunity();
        opportunity.setOpportunityNumber("OPP-" + UUID.randomUUID().toString().substring(0, 8));
        opportunity.setTitle("Test Opp");
        opportunity.setClient(client);
        opportunity.setLead(lead);
        opportunity.setProductCategory(category);
        opportunity.setStage(com.knoweb.salesmanagement.opportunity.enums.OpportunityStage.QUALIFIED);
        opportunity.setEstimatedValue(java.math.BigDecimal.valueOf(10000));
        opportunity.setExpectedCloseDate(java.time.LocalDate.now().plusDays(30));
        opportunity = opportunityRepository.save(opportunity);

        pb = new ProjectBrief();
        pb.setOpportunity(opportunity);
        pb.setStatus(ProjectBriefStatus.DRAFT);
        pb.setProjectTitle("Test Title");
        pb.setBusinessProblem("Problem");
        pb.setRequiredSolution("Solution");
        pb.setProjectScope("Scope");
        pb.setTechnicalRequirements("Tech");
        pb.setExpectedBudget(java.math.BigDecimal.valueOf(1000));
        pb.setCurrency("USD");
        pb.setDueAt(java.time.OffsetDateTime.now().plusDays(1));
        pb.setExpectedDeadline(java.time.LocalDate.now().plusDays(10));
        pb = projectBriefRepository.save(pb);
    }

    private void makeEligible() {
        pb.setStatus(ProjectBriefStatus.CLIENT_VERIFIED);
        projectBriefRepository.saveAndFlush(pb);

        ClientVerification cv = new ClientVerification();
        cv.setOpportunity(pb.getOpportunity());
        cv.setProjectBrief(pb);
        cv.setProjectBriefVersionNumber(pb.getCurrentVersionNumber());
        cv.setStatus(ClientVerificationStatus.CONFIRMED);
        cv.setTokenHash("test-token-" + UUID.randomUUID());
        cv.setExpiresAt(java.time.OffsetDateTime.now().plusDays(1));
        
        com.knoweb.salesmanagement.user.entity.User admin = userRepository.findAll().get(0);
        cv.setCreatedBy(admin);
        
        clientVerificationRepository.saveAndFlush(cv);

        BdmApproval ba = new BdmApproval();
        ba.setOpportunity(pb.getOpportunity());
        ba.setProjectBrief(pb);
        ba.setProjectBriefVersionNumber(pb.getCurrentVersionNumber());
        ba.setStatus(BdmApprovalStatus.APPROVED);
        bdmApprovalRepository.saveAndFlush(ba);
    }

    @Test
    void testEligibleProjectBrief() {
        makeEligible();
        TechnicalProjectEligibilityDTO eligibility = eligibilityService.checkEligibility(pb.getId());
        assertThat(eligibility.isEligible()).isTrue();
        assertThat(eligibility.getReasonCode()).isEqualTo(TechnicalProjectEligibilityReason.ELIGIBLE);
    }

    @Test
    void testWithoutClientVerification() {
        makeEligible();
        clientVerificationRepository.findByOpportunityIdOrderByCreatedAtDesc(pb.getOpportunity().getId())
            .forEach(clientVerificationRepository::delete);
        clientVerificationRepository.flush();

        TechnicalProjectEligibilityDTO eligibility = eligibilityService.checkEligibility(pb.getId());
        assertThat(eligibility.isEligible()).isFalse();
        assertThat(eligibility.getReasonCode()).isEqualTo(TechnicalProjectEligibilityReason.CLIENT_VERIFICATION_REQUIRED);
    }

    @Test
    void testNonApprovedClientVerification() {
        makeEligible();
        ClientVerification cv = clientVerificationRepository.findByOpportunityIdOrderByCreatedAtDesc(pb.getOpportunity().getId()).get(0);
        cv.setStatus(ClientVerificationStatus.REJECTED);
        clientVerificationRepository.saveAndFlush(cv);

        TechnicalProjectEligibilityDTO eligibility = eligibilityService.checkEligibility(pb.getId());
        assertThat(eligibility.isEligible()).isFalse();
        assertThat(eligibility.getReasonCode()).isEqualTo(TechnicalProjectEligibilityReason.CLIENT_VERIFICATION_NOT_APPROVED);
    }

    @Test
    void testWithoutBdmApproval() {
        makeEligible();
        bdmApprovalRepository.findByOpportunityIdOrderByCreatedAtDesc(pb.getOpportunity().getId())
            .forEach(bdmApprovalRepository::delete);
        bdmApprovalRepository.flush();

        TechnicalProjectEligibilityDTO eligibility = eligibilityService.checkEligibility(pb.getId());
        assertThat(eligibility.isEligible()).isFalse();
        assertThat(eligibility.getReasonCode()).isEqualTo(TechnicalProjectEligibilityReason.BDM_APPROVAL_REQUIRED);
    }

    @Test
    void testNonApprovedBdmApproval() {
        makeEligible();
        BdmApproval ba = bdmApprovalRepository.findByOpportunityIdOrderByCreatedAtDesc(pb.getOpportunity().getId()).get(0);
        ba.setStatus(BdmApprovalStatus.REJECTED);
        bdmApprovalRepository.saveAndFlush(ba);

        TechnicalProjectEligibilityDTO eligibility = eligibilityService.checkEligibility(pb.getId());
        assertThat(eligibility.isEligible()).isFalse();
        assertThat(eligibility.getReasonCode()).isEqualTo(TechnicalProjectEligibilityReason.BDM_APPROVAL_NOT_APPROVED);
    }

    @Test
    void testClientVerifiedStatusNotSufficient() {
        pb.setStatus(ProjectBriefStatus.CLIENT_VERIFIED);
        projectBriefRepository.saveAndFlush(pb);

        TechnicalProjectEligibilityDTO eligibility = eligibilityService.checkEligibility(pb.getId());
        assertThat(eligibility.isEligible()).isFalse();
        // Missing verifications/approvals actually takes precedence in the check
        assertThat(eligibility.getReasonCode()).isEqualTo(TechnicalProjectEligibilityReason.CLIENT_VERIFICATION_REQUIRED);
    }

    @Test
    void testVersionMismatch() {
        makeEligible();
        
        // Change current version of brief but leave approvals pointing to old version
        pb.setCurrentVersionNumber(pb.getCurrentVersionNumber() + 1);
        projectBriefRepository.saveAndFlush(pb);

        TechnicalProjectEligibilityDTO eligibility = eligibilityService.checkEligibility(pb.getId());
        assertThat(eligibility.isEligible()).isFalse();
        assertThat(eligibility.getReasonCode()).isEqualTo(TechnicalProjectEligibilityReason.CLIENT_VERIFICATION_REQUIRED);
    }

    @Test
    void testExistingTechnicalProjectMakesIneligible() {
        makeEligible();
        
        TechnicalProject tp = new TechnicalProject();
        tp.setProjectBrief(pb);
        tp.setSalesOpportunity(pb.getOpportunity());
        tp.setProjectCode("TP-TEST-0002");
        tp.setStatus(TechnicalProjectStatus.AWAITING_TECHNICAL_ROUTING);
        technicalProjectRepository.saveAndFlush(tp);

        TechnicalProjectEligibilityDTO eligibility = eligibilityService.checkEligibility(pb.getId());
        assertThat(eligibility.isEligible()).isFalse();
        assertThat(eligibility.getReasonCode()).isEqualTo(TechnicalProjectEligibilityReason.TECHNICAL_PROJECT_ALREADY_EXISTS);
    }

    @Test
    void testValidInitializationCreatesExactlyOneTechnicalProject() {
        makeEligible();
        
        TechnicalProject project = initializationService.initializeTechnicalProject(pb.getId());
        technicalProjectRepository.flush();

        assertThat(project.getId()).isNotNull();
        assertThat(project.getProjectCode()).isNotBlank();
        assertThat(project.getStatus()).isEqualTo(TechnicalProjectStatus.AWAITING_TECHNICAL_ROUTING);
        assertThat(project.getRoutedAt()).isNull();
        assertThat(project.getSalesOpportunity().getId()).isEqualTo(pb.getOpportunity().getId());
    }

    @Test
    void testRepeatedInitializationThrowsConflict() {
        makeEligible();
        initializationService.initializeTechnicalProject(pb.getId());
        technicalProjectRepository.flush();

        assertThatThrownBy(() -> initializationService.initializeTechnicalProject(pb.getId()))
            .isInstanceOf(TechnicalProjectAlreadyExistsException.class);
    }
}
