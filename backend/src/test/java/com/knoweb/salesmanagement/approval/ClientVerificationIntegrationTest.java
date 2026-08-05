package com.knoweb.salesmanagement.approval;

import com.knoweb.salesmanagement.approval.dto.BdmDecisionRequest;
import com.knoweb.salesmanagement.approval.dto.ClientDecisionRequest;
import com.knoweb.salesmanagement.approval.dto.ClientVerificationDTO;
import com.knoweb.salesmanagement.approval.dto.ClientVerificationRequest;
import com.knoweb.salesmanagement.approval.entity.ClientVerification;
import com.knoweb.salesmanagement.approval.enums.ClientVerificationStatus;
import com.knoweb.salesmanagement.approval.repository.ClientVerificationRepository;
import com.knoweb.salesmanagement.approval.service.BdmApprovalService;
import com.knoweb.salesmanagement.approval.service.ClientVerificationService;
import com.knoweb.salesmanagement.client.entity.Client;
import com.knoweb.salesmanagement.client.enums.ClientType;
import com.knoweb.salesmanagement.client.repository.ClientRepository;
import com.knoweb.salesmanagement.department.entity.Department;
import com.knoweb.salesmanagement.department.repository.DepartmentRepository;
import com.knoweb.salesmanagement.lead.entity.Lead;
import com.knoweb.salesmanagement.lead.enums.InquirySource;
import com.knoweb.salesmanagement.lead.enums.LeadStatus;
import com.knoweb.salesmanagement.lead.repository.LeadRepository;
import com.knoweb.salesmanagement.opportunity.entity.SalesOpportunity;
import com.knoweb.salesmanagement.opportunity.repository.SalesOpportunityRepository;
import com.knoweb.salesmanagement.productcategory.entity.ProductCategory;
import com.knoweb.salesmanagement.productcategory.repository.ProductCategoryRepository;
import com.knoweb.salesmanagement.projectbrief.dto.ProjectBriefSubmitRequest;
import com.knoweb.salesmanagement.projectbrief.entity.ProjectBrief;
import com.knoweb.salesmanagement.projectbrief.entity.ProjectBriefVersion;
import com.knoweb.salesmanagement.projectbrief.enums.ProjectBriefStatus;
import com.knoweb.salesmanagement.projectbrief.repository.ProjectBriefRepository;
import com.knoweb.salesmanagement.projectbrief.repository.ProjectBriefVersionRepository;
import com.knoweb.salesmanagement.projectbrief.service.ProjectBriefService;
import com.knoweb.salesmanagement.role.entity.Role;
import com.knoweb.salesmanagement.role.repository.RoleRepository;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class ClientVerificationIntegrationTest {

    @Autowired
    private ClientVerificationService clientVerificationService;

    @Autowired
    private ClientVerificationRepository clientVerificationRepository;

    @Autowired
    private BdmApprovalService bdmApprovalService;

    @Autowired
    private ProjectBriefService projectBriefService;

    @Autowired
    private ProjectBriefRepository projectBriefRepository;

    @Autowired
    private ProjectBriefVersionRepository projectBriefVersionRepository;

    @Autowired
    private SalesOpportunityRepository salesOpportunityRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private LeadRepository leadRepository;

    @Autowired
    private ProductCategoryRepository productCategoryRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    private ProjectBrief testProjectBrief;
    private SalesOpportunity testOpportunity;

    @BeforeEach
    public void setup() {
        testOpportunity = new SalesOpportunity();
        testOpportunity.setOpportunityNumber("OPP-VERIFY-TEST-" + UUID.randomUUID().toString().substring(0, 4));

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
        category.setCode("SW-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        category.setName(("Software-" + java.util.UUID.randomUUID().toString()));
        productCategoryRepository.save(category);

        testOpportunity.setTitle("Test Opportunity");
        testOpportunity.setClient(client);
        testOpportunity.setLead(lead);
        testOpportunity.setProductCategory(category);
        testOpportunity.setStage(com.knoweb.salesmanagement.opportunity.enums.OpportunityStage.QUALIFIED);
        testOpportunity.setEstimatedValue(BigDecimal.valueOf(100000));
        testOpportunity.setExpectedCloseDate(LocalDate.now().plusDays(30));
        testOpportunity = salesOpportunityRepository.save(testOpportunity);

        testProjectBrief = new ProjectBrief();
        testProjectBrief.setOpportunity(testOpportunity);
        testProjectBrief.setStatus(ProjectBriefStatus.DRAFT);
        testProjectBrief.setCurrentVersionNumber(1);
        testProjectBrief.setProjectTitle("Test Title");
        testProjectBrief.setBusinessProblem("Problem");
        testProjectBrief.setRequiredSolution("Solution");
        testProjectBrief.setProjectScope("Scope");
        testProjectBrief.setTechnicalRequirements("Tech");
        testProjectBrief.setExpectedBudget(BigDecimal.valueOf(100000));
        testProjectBrief.setCurrency("LKR");
        testProjectBrief.setDueAt(OffsetDateTime.now().plusDays(1));
        testProjectBrief.setExpectedDeadline(LocalDate.now().plusDays(10));
        Department dept = new Department();
        dept.setCode("DEP-TEST-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        dept.setName("IT");
        departmentRepository.save(dept);
        testProjectBrief.getRequiredDepartments().add(dept);
        testProjectBrief = projectBriefRepository.save(testProjectBrief);

        ProjectBriefVersion version = new ProjectBriefVersion();
        version.setProjectBrief(testProjectBrief);
        version.setVersionNumber(1);
        version.setSnapshot("{\"projectTitle\":\"Test Title\"}");
        version.setSubmittedVersion(true);
        projectBriefVersionRepository.save(version);

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

    private void approveProjectBrief() {
        ProjectBriefSubmitRequest req = new ProjectBriefSubmitRequest();
        projectBriefService.submitProjectBrief(testProjectBrief.getId(), req);

        BdmDecisionRequest decisionReq = new BdmDecisionRequest();
        decisionReq.setComments("Approved for client verification");
        bdmApprovalService.approve(testProjectBrief.getId(), decisionReq);
    }

    @Test
    @WithMockUser(username = "admin@test.com", authorities = {"PROJECT_BRIEF_UPDATE", "BDM_APPROVAL_READ", "BDM_APPROVAL_DECIDE", "CLIENT_VERIFICATION_CREATE", "CLIENT_VERIFICATION_READ", "CLIENT_VERIFICATION_READ_LINK"})
    public void testCreateAndGetVerificationLink_ShowsRecoverableAndDates() {
        approveProjectBrief();

        ClientVerificationRequest request = new ClientVerificationRequest();
        request.setOpportunityId(testOpportunity.getId());
        request.setVerifierName("John Verifier");
        request.setVerifierEmail("john@verifier.com");

        String token = clientVerificationService.createVerification(testProjectBrief.getId(), request);
        assertNotNull(token);

        List<ClientVerificationDTO> verifications = clientVerificationService.getVerificationsForOpportunity(testOpportunity.getId());
        assertEquals(1, verifications.size());
        ClientVerificationDTO dto = verifications.get(0);
        assertEquals(ClientVerificationStatus.PENDING, dto.getStatus());
        assertNotNull(dto.getCreatedAt());
        assertNotNull(dto.getExpiresAt());
        assertTrue(dto.getRecoverable(), "Token should be recoverable");
        assertNotNull(dto.getProjectBriefSnapshot());

        String retrievedLink = clientVerificationService.getVerificationLink(dto.getId());
        assertEquals(token, retrievedLink);
    }

    @Test
    @WithMockUser(username = "admin@test.com", authorities = {"PROJECT_BRIEF_UPDATE", "BDM_APPROVAL_READ", "BDM_APPROVAL_DECIDE", "CLIENT_VERIFICATION_CREATE", "CLIENT_VERIFICATION_READ", "CLIENT_VERIFICATION_READ_LINK"})
    public void testOnlyOneActiveVerificationLinkAllowed() {
        approveProjectBrief();

        ClientVerificationRequest request1 = new ClientVerificationRequest();
        request1.setOpportunityId(testOpportunity.getId());
        request1.setVerifierName("John Verifier");
        request1.setVerifierEmail("john@verifier.com");

        clientVerificationService.createVerification(testProjectBrief.getId(), request1);

        ClientVerificationRequest request2 = new ClientVerificationRequest();
        request2.setOpportunityId(testOpportunity.getId());
        request2.setVerifierName("John Verifier 2");
        request2.setVerifierEmail("john2@verifier.com");

        assertThrows(RuntimeException.class, () -> {
            clientVerificationService.createVerification(testProjectBrief.getId(), request2);
        });
    }

    @Test
    @WithMockUser(username = "admin@test.com", authorities = {"PROJECT_BRIEF_UPDATE", "BDM_APPROVAL_READ", "BDM_APPROVAL_DECIDE", "CLIENT_VERIFICATION_CREATE", "CLIENT_VERIFICATION_READ", "CLIENT_VERIFICATION_READ_LINK"})
    public void testRegenerateVerificationLink_RevokesOldToken() {
        approveProjectBrief();

        ClientVerificationRequest request = new ClientVerificationRequest();
        request.setOpportunityId(testOpportunity.getId());
        request.setVerifierName("John Verifier");
        request.setVerifierEmail("john@verifier.com");

        String token1 = clientVerificationService.createVerification(testProjectBrief.getId(), request);

        List<ClientVerificationDTO> verificationsBefore = clientVerificationService.getVerificationsForOpportunity(testOpportunity.getId());
        UUID oldId = verificationsBefore.get(0).getId();

        String token2 = clientVerificationService.regenerateVerificationLink(oldId);
        assertNotNull(token2);
        assertNotEquals(token1, token2);

        List<ClientVerificationDTO> verificationsAfter = clientVerificationService.getVerificationsForOpportunity(testOpportunity.getId());
        assertEquals(2, verificationsAfter.size());

        ClientVerification oldEntity = clientVerificationRepository.findById(oldId).orElseThrow();
        assertEquals(ClientVerificationStatus.REVOKED, oldEntity.getStatus());
    }

    @Test
    @WithMockUser(username = "admin@test.com", authorities = {"PROJECT_BRIEF_UPDATE", "BDM_APPROVAL_READ", "BDM_APPROVAL_DECIDE", "CLIENT_VERIFICATION_CREATE", "CLIENT_VERIFICATION_READ", "CLIENT_VERIFICATION_READ_LINK"})
    public void testCannotRegenerateConfirmedVerification() {
        approveProjectBrief();

        ClientVerificationRequest request = new ClientVerificationRequest();
        request.setOpportunityId(testOpportunity.getId());
        request.setVerifierName("John Verifier");
        request.setVerifierEmail("john@verifier.com");

        String token1 = clientVerificationService.createVerification(testProjectBrief.getId(), request);

        ClientDecisionRequest submitRequest = new ClientDecisionRequest();
        submitRequest.setVerifierName("John Verifier");
        submitRequest.setDigitalConfirmation(true);
        clientVerificationService.confirmVerification(token1, submitRequest);

        List<ClientVerificationDTO> verifications = clientVerificationService.getVerificationsForOpportunity(testOpportunity.getId());
        UUID id = verifications.get(0).getId();

        assertThrows(RuntimeException.class, () -> {
            clientVerificationService.regenerateVerificationLink(id);
        });
    }
}
