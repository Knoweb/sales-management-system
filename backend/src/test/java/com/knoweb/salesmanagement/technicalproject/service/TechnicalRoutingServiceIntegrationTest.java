package com.knoweb.salesmanagement.technicalproject.service;

import com.knoweb.salesmanagement.approval.entity.BdmApproval;
import com.knoweb.salesmanagement.approval.entity.ClientVerification;
import com.knoweb.salesmanagement.approval.enums.BdmApprovalStatus;
import com.knoweb.salesmanagement.approval.enums.ClientVerificationStatus;
import com.knoweb.salesmanagement.approval.repository.BdmApprovalRepository;
import com.knoweb.salesmanagement.approval.repository.ClientVerificationRepository;
import com.knoweb.salesmanagement.department.entity.Department;
import com.knoweb.salesmanagement.department.repository.DepartmentRepository;
import com.knoweb.salesmanagement.projectbrief.entity.ProjectBrief;
import com.knoweb.salesmanagement.projectbrief.enums.ProjectBriefStatus;
import com.knoweb.salesmanagement.projectbrief.repository.ProjectBriefRepository;
import com.knoweb.salesmanagement.technicalproject.dto.EligibleProjectBriefSummaryDTO;
import com.knoweb.salesmanagement.technicalproject.dto.TechnicalRoutingDepartmentRequest;
import com.knoweb.salesmanagement.technicalproject.dto.TechnicalRoutingRequest;
import com.knoweb.salesmanagement.technicalproject.entity.TechnicalProject;
import com.knoweb.salesmanagement.technicalproject.enums.TechnicalProjectStatus;
import com.knoweb.salesmanagement.technicalproject.repository.TechnicalProjectDepartmentRepository;
import com.knoweb.salesmanagement.technicalproject.repository.TechnicalProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class TechnicalRoutingServiceIntegrationTest {

    @Autowired private TechnicalRoutingService technicalRoutingService;
    @Autowired private TechnicalProjectInitializationService initializationService;
    @Autowired private ProjectBriefRepository projectBriefRepository;
    @Autowired private ClientVerificationRepository clientVerificationRepository;
    @Autowired private BdmApprovalRepository bdmApprovalRepository;
    @Autowired private TechnicalProjectRepository technicalProjectRepository;
    @Autowired private TechnicalProjectDepartmentRepository departmentAssignmentRepository;
    @Autowired private DepartmentRepository departmentRepository;
    @Autowired private com.knoweb.salesmanagement.client.repository.ClientRepository clientRepository;
    @Autowired private com.knoweb.salesmanagement.lead.repository.LeadRepository leadRepository;
    @Autowired private com.knoweb.salesmanagement.productcategory.repository.ProductCategoryRepository categoryRepository;
    @Autowired private com.knoweb.salesmanagement.opportunity.repository.SalesOpportunityRepository opportunityRepository;
    @Autowired private com.knoweb.salesmanagement.user.repository.UserRepository userRepository;

    private ProjectBrief pb;
    private Department devDept;

    @BeforeEach
    void setUp() {
        com.knoweb.salesmanagement.user.entity.User admin = new com.knoweb.salesmanagement.user.entity.User();
        admin.setEmail("routing_admin_" + UUID.randomUUID() + "@test.com");
        admin.setFirstName("Routing");
        admin.setLastName("Admin");
        admin.setPasswordHash("pass");
        admin = userRepository.save(admin);

        devDept = new Department();
        devDept.setName("Development");
        devDept.setCode("DEV");
        devDept.setActive(true);
        devDept = departmentRepository.save(devDept);

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
        pb.setStatus(ProjectBriefStatus.CLIENT_VERIFIED);
        pb.setProjectTitle("Test Routing Title");
        pb.setBusinessProblem("Problem");
        pb.setRequiredSolution("Solution");
        pb.setProjectScope("Scope");
        pb.setTechnicalRequirements("Tech");
        pb.setExpectedBudget(java.math.BigDecimal.valueOf(1000));
        pb.setCurrency("USD");
        pb.setDueAt(java.time.OffsetDateTime.now().plusDays(1));
        pb.setExpectedDeadline(java.time.LocalDate.now().plusDays(10));
        pb = projectBriefRepository.save(pb);
        
        ClientVerification cv = new ClientVerification();
        cv.setOpportunity(pb.getOpportunity());
        cv.setProjectBrief(pb);
        cv.setProjectBriefVersionNumber(pb.getCurrentVersionNumber());
        cv.setStatus(ClientVerificationStatus.CONFIRMED);
        cv.setTokenHash("test-token-" + UUID.randomUUID());
        cv.setExpiresAt(java.time.OffsetDateTime.now().plusDays(1));
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
    void testGetEligibleProjectBriefs() {
        Page<EligibleProjectBriefSummaryDTO> eligible = technicalRoutingService.getEligibleProjectBriefs(PageRequest.of(0, 10));
        assertThat(eligible.getContent()).anyMatch(dto -> dto.getId().equals(pb.getId()));
    }

    @Test
    void testRouteProject() {
        TechnicalProject tp = initializationService.initializeTechnicalProject(pb.getId());
        
        TechnicalRoutingRequest request = new TechnicalRoutingRequest();
        TechnicalRoutingDepartmentRequest deptReq = new TechnicalRoutingDepartmentRequest();
        deptReq.setDepartmentId(devDept.getId());
        deptReq.setRequiredScope("Full backend rewrite");
        deptReq.setExpectedEstimateSubmissionDate(LocalDate.now().plusDays(7));
        request.setDepartments(List.of(deptReq));
        
        technicalRoutingService.routeProject(tp.getId(), request);
        
        TechnicalProject updatedTp = technicalProjectRepository.findById(tp.getId()).orElseThrow();
        assertThat(updatedTp.getStatus()).isEqualTo(TechnicalProjectStatus.ROUTED);
        assertThat(updatedTp.getRoutedAt()).isNotNull();
        
        long count = departmentAssignmentRepository.countByTechnicalProjectId(tp.getId());
        assertThat(count).isEqualTo(1);
    }

    @Test
    void testReviseRouting_Success() {
        TechnicalProject tp = initializationService.initializeTechnicalProject(pb.getId());
        
        TechnicalRoutingRequest request = new TechnicalRoutingRequest();
        TechnicalRoutingDepartmentRequest deptReq = new TechnicalRoutingDepartmentRequest();
        deptReq.setDepartmentId(devDept.getId());
        deptReq.setRequiredScope("Initial Scope");
        deptReq.setExpectedEstimateSubmissionDate(LocalDate.now().plusDays(7));
        request.setDepartments(List.of(deptReq));
        
        technicalRoutingService.routeProject(tp.getId(), request);
        
        TechnicalProject updatedTp = technicalProjectRepository.findById(tp.getId()).orElseThrow();

        com.knoweb.salesmanagement.technicalproject.dto.TechnicalRoutingRevisionRequest revisionReq = new com.knoweb.salesmanagement.technicalproject.dto.TechnicalRoutingRevisionRequest();
        TechnicalRoutingDepartmentRequest updatedDeptReq = new TechnicalRoutingDepartmentRequest();
        updatedDeptReq.setDepartmentId(devDept.getId());
        updatedDeptReq.setRequiredScope("Revised Scope");
        updatedDeptReq.setExpectedEstimateSubmissionDate(LocalDate.now().plusDays(10));
        revisionReq.setDepartments(List.of(updatedDeptReq));
        revisionReq.setRevisionReason("Scope changed");
        revisionReq.setOptimisticLockVersion(updatedTp.getVersion());

        technicalRoutingService.reviseRouting(tp.getId(), revisionReq);

        var assignment = departmentAssignmentRepository.findByTechnicalProjectId(tp.getId()).get(0);
        assertThat(assignment.getRequiredScope()).isEqualTo("Revised Scope");
        assertThat(assignment.getExpectedEstimateSubmissionDate()).isEqualTo(LocalDate.now().plusDays(10));
    }

    @Test
    void testSearchProjects_NullSearch() {
        TechnicalProject tp = initializationService.initializeTechnicalProject(pb.getId());
        Page<com.knoweb.salesmanagement.technicalproject.dto.TechnicalProjectSummaryDTO> result = technicalRoutingService.getTechnicalProjectsQueue(null, null, PageRequest.of(0, 10));
        assertThat(result.getContent()).hasSizeGreaterThanOrEqualTo(1);
    }

    @Test
    void testSearchProjects_BlankSearch() {
        TechnicalProject tp = initializationService.initializeTechnicalProject(pb.getId());
        Page<com.knoweb.salesmanagement.technicalproject.dto.TechnicalProjectSummaryDTO> result = technicalRoutingService.getTechnicalProjectsQueue("   ", null, PageRequest.of(0, 10));
        assertThat(result.getContent()).hasSizeGreaterThanOrEqualTo(1);
    }

    @Test
    void testSearchProjects_MatchingSearch() {
        TechnicalProject tp = initializationService.initializeTechnicalProject(pb.getId());
        Page<com.knoweb.salesmanagement.technicalproject.dto.TechnicalProjectSummaryDTO> result = technicalRoutingService.getTechnicalProjectsQueue("Test Routing Title", null, PageRequest.of(0, 10));
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void testSearchProjects_NonMatchingSearch() {
        TechnicalProject tp = initializationService.initializeTechnicalProject(pb.getId());
        Page<com.knoweb.salesmanagement.technicalproject.dto.TechnicalProjectSummaryDTO> result = technicalRoutingService.getTechnicalProjectsQueue("Does Not Exist XYZ", null, PageRequest.of(0, 10));
        assertThat(result.getContent()).isEmpty();
    }
}
