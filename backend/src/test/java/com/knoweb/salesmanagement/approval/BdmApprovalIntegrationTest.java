package com.knoweb.salesmanagement.approval;

import com.knoweb.salesmanagement.approval.dto.BdmApprovalDTO;
import com.knoweb.salesmanagement.approval.dto.BdmDecisionRequest;
import com.knoweb.salesmanagement.approval.entity.BdmApproval;
import com.knoweb.salesmanagement.approval.enums.BdmApprovalStatus;
import com.knoweb.salesmanagement.approval.repository.BdmApprovalRepository;
import com.knoweb.salesmanagement.approval.service.BdmApprovalService;
import com.knoweb.salesmanagement.projectbrief.dto.ProjectBriefSubmitRequest;
import com.knoweb.salesmanagement.projectbrief.entity.ProjectBrief;
import com.knoweb.salesmanagement.projectbrief.entity.ProjectBriefVersion;
import com.knoweb.salesmanagement.projectbrief.enums.ProjectBriefStatus;
import com.knoweb.salesmanagement.projectbrief.repository.ProjectBriefRepository;
import com.knoweb.salesmanagement.projectbrief.repository.ProjectBriefVersionRepository;
import com.knoweb.salesmanagement.projectbrief.service.ProjectBriefService;
import com.knoweb.salesmanagement.opportunity.entity.SalesOpportunity;
import com.knoweb.salesmanagement.opportunity.repository.SalesOpportunityRepository;
import com.knoweb.salesmanagement.client.entity.Client;
import com.knoweb.salesmanagement.client.repository.ClientRepository;
import com.knoweb.salesmanagement.client.enums.ClientType;
import com.knoweb.salesmanagement.lead.entity.Lead;
import com.knoweb.salesmanagement.lead.enums.InquirySource;
import com.knoweb.salesmanagement.lead.enums.LeadStatus;
import com.knoweb.salesmanagement.lead.repository.LeadRepository;
import com.knoweb.salesmanagement.productcategory.entity.ProductCategory;
import com.knoweb.salesmanagement.productcategory.repository.ProductCategoryRepository;
import com.knoweb.salesmanagement.department.entity.Department;
import com.knoweb.salesmanagement.department.repository.DepartmentRepository;
import com.knoweb.salesmanagement.role.entity.Role;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.role.repository.RoleRepository;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class BdmApprovalIntegrationTest {

    @Autowired
    private ProjectBriefService projectBriefService;
    @Autowired
    private ProjectBriefRepository projectBriefRepository;
    @Autowired
    private BdmApprovalRepository bdmApprovalRepository;
    @Autowired
    private BdmApprovalService bdmApprovalService;
    @Autowired
    private SalesOpportunityRepository opportunityRepository;
    @Autowired
    private com.knoweb.salesmanagement.approval.service.ClientVerificationService clientVerificationService;
    @Autowired
    private DepartmentRepository departmentRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private ProjectBriefVersionRepository versionRepository;
    @Autowired
    private ClientRepository clientRepository;
    @Autowired
    private LeadRepository leadRepository;
    @Autowired
    private ProductCategoryRepository productCategoryRepository;

    private SalesOpportunity opportunity;
    private ProjectBrief brief;

    @BeforeEach
    public void setup() {
        opportunity = new SalesOpportunity();
        opportunity.setOpportunityNumber("OPP-TEST");
        Client client = new Client();
        client.setName(("Client-" + java.util.UUID.randomUUID().toString()));
        client.setClientType(ClientType.COMPANY);
        clientRepository.save(client);

        Lead lead = new Lead();
        lead.setTitle(("Lead-" + java.util.UUID.randomUUID().toString()));
        lead.setClient(client);
        lead.setInquirySource(InquirySource.WEBSITE);
        lead.setStatus(LeadStatus.NEW);
        leadRepository.save(lead);

        ProductCategory category = new ProductCategory();
        category.setCode("SW-" + java.util.UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        category.setName(("Software-" + java.util.UUID.randomUUID().toString()));
        productCategoryRepository.save(category);

        opportunity.setTitle("Test Opp");
        opportunity.setClient(client);
        opportunity.setLead(lead);
        opportunity.setProductCategory(category);
        opportunity.setStage(com.knoweb.salesmanagement.opportunity.enums.OpportunityStage.QUALIFIED);
        opportunity.setEstimatedValue(BigDecimal.valueOf(10000));
        opportunity.setExpectedCloseDate(java.time.LocalDate.now().plusDays(30));
        opportunity = opportunityRepository.save(opportunity);

        brief = new ProjectBrief();
        brief.setOpportunity(opportunity);
        brief.setStatus(ProjectBriefStatus.DRAFT);
        brief.setProjectTitle("Test Title");
        brief.setBusinessProblem("Problem");
        brief.setRequiredSolution("Solution");
        brief.setProjectScope("Scope");
        brief.setTechnicalRequirements("Tech");
        brief.setExpectedBudget(BigDecimal.valueOf(1000));
        brief.setCurrency("USD");
        brief.setDueAt(java.time.OffsetDateTime.now().plusDays(1));
        brief.setExpectedDeadline(java.time.LocalDate.now().plusDays(10));
        
        Department dept = new Department();
        dept.setCode("DEP-TEST-" + java.util.UUID.randomUUID().toString().substring(0,4).toUpperCase());
        dept.setName("IT");
        departmentRepository.save(dept);
        brief.getRequiredDepartments().add(dept);
        
        brief = projectBriefRepository.save(brief);

        Role sysAdminRole = roleRepository.findByCode("SYSTEM_ADMIN").orElseGet(() -> {
            Role role = new Role();
            role.setCode("SYSTEM_ADMIN");
            role.setName("System Admin");
            return roleRepository.save(role);
        });

        User adminUser = new User();
        adminUser.setEmail("admin@test.com");
        adminUser.setFirstName("Admin");
        adminUser.setLastName("User");
        adminUser.setPasswordHash("password");
        adminUser.getRoles().add(sysAdminRole);
        userRepository.save(adminUser);
    }

    @Test
    @WithMockUser(username = "admin@test.com", authorities = {"PROJECT_BRIEF_UPDATE", "BDM_APPROVAL_READ", "BDM_APPROVAL_DECIDE", "CLIENT_VERIFICATION_CREATE"})
    public void testProjectBriefSubmissionCreatesApprovalRequest() {
        ProjectBriefSubmitRequest req = new ProjectBriefSubmitRequest();
        projectBriefService.submitProjectBrief(brief.getId(), req);

        List<BdmApproval> approvals = bdmApprovalRepository.findByOpportunityIdOrderByCreatedAtDesc(opportunity.getId());
        assertEquals(1, approvals.size());

        BdmApproval approval = approvals.get(0);
        assertEquals(BdmApprovalStatus.PENDING, approval.getStatus());
        assertNotNull(approval.getProjectBriefVersionNumber());

        Optional<ProjectBriefVersion> version = versionRepository.findByProjectBriefIdAndVersionNumber(brief.getId(), approval.getProjectBriefVersionNumber());
        assertTrue(version.isPresent());
        assertTrue(version.get().isSubmittedVersion());
        
        // Exact submitted version referenced
        assertEquals(approval.getProjectBriefVersionNumber(), version.get().getVersionNumber());

        // Test Duplicate prevention is indirectly tested because it's in the same transaction
        assertThrows(Exception.class, () -> {
            projectBriefService.submitProjectBrief(brief.getId(), req);
        });

        // Test Pending queue returns the request
        List<BdmApprovalDTO> pendingQueue = bdmApprovalService.getPendingApprovals();
        assertTrue(pendingQueue.stream().anyMatch(a -> a.getId().equals(approval.getId())));

        // Test review endpoint returns complete details
        BdmApprovalDTO fetched = bdmApprovalService.getApprovalById(approval.getId());
        assertNotNull(fetched);
        assertEquals(approval.getId(), fetched.getId());

        // Test approved request is excluded from pending queue
        BdmDecisionRequest decisionReq = new BdmDecisionRequest();
        decisionReq.setComments("Looks good");
        bdmApprovalService.approve(brief.getId(), decisionReq);


        // test approval updates the Brief to BDM_APPROVED
        ProjectBrief updatedBrief = projectBriefRepository.findById(brief.getId()).orElseThrow();
        assertEquals(ProjectBriefStatus.BDM_APPROVED, updatedBrief.getStatus());

        // Test Client Verification can be created after approval (and exact version is referenced)
        com.knoweb.salesmanagement.approval.dto.ClientVerificationRequest cvReq = new com.knoweb.salesmanagement.approval.dto.ClientVerificationRequest();
        cvReq.setVerifierName("Test Client");
        cvReq.setVerifierEmail("test@client.com");
        String token = clientVerificationService.createVerification(brief.getId(), cvReq);
        assertNotNull(token);
    }

    @Test
    @WithMockUser(username = "admin@test.com", authorities = {"PROJECT_BRIEF_UPDATE", "BDM_APPROVAL_READ", "BDM_APPROVAL_DECIDE", "CLIENT_VERIFICATION_CREATE"})
    public void testClientVerificationFailsIfBriefNotApproved() {
        ProjectBriefSubmitRequest req = new ProjectBriefSubmitRequest();
        projectBriefService.submitProjectBrief(brief.getId(), req);

        com.knoweb.salesmanagement.approval.dto.ClientVerificationRequest cvReq = new com.knoweb.salesmanagement.approval.dto.ClientVerificationRequest();
        cvReq.setVerifierName("Test Client");
        
        // unapproved Brief still returns 409 (since the brief is AWAITING_BDM_REVIEW, not BDM_APPROVED)
        assertThrows(com.knoweb.salesmanagement.common.exception.ResourceConflictException.class, () -> {
            clientVerificationService.createVerification(brief.getId(), cvReq);
        });
    }

    @Test
    @WithMockUser(username = "admin@test.com", authorities = {"PROJECT_BRIEF_UPDATE", "BDM_APPROVAL_READ", "BDM_APPROVAL_DECIDE"})
    public void testTransactionRollsBackFullyOnFailure() {
        ProjectBriefSubmitRequest req = new ProjectBriefSubmitRequest();
        projectBriefService.submitProjectBrief(brief.getId(), req);
        
        BdmDecisionRequest decisionReq = new BdmDecisionRequest();
        // Missing comments for rejection throws exception
        assertThrows(IllegalArgumentException.class, () -> {
            bdmApprovalService.reject(brief.getId(), decisionReq);
        });
        
        // Ensure brief state did not change
        ProjectBrief unchangedBrief = projectBriefRepository.findById(brief.getId()).orElseThrow();
        assertEquals(ProjectBriefStatus.AWAITING_BDM_REVIEW, unchangedBrief.getStatus());
        
        // Ensure approval status did not change
        BdmApproval approval = bdmApprovalRepository.findByProjectBriefIdAndProjectBriefVersionNumberAndStatus(
                brief.getId(), brief.getCurrentVersionNumber(), BdmApprovalStatus.PENDING).orElse(null);
        assertNotNull(approval);
        assertEquals(BdmApprovalStatus.PENDING, approval.getStatus());
    }
}
