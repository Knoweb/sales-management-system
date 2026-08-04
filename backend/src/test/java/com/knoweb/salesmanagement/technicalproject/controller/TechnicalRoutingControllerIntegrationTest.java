package com.knoweb.salesmanagement.technicalproject.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.knoweb.salesmanagement.department.entity.Department;
import com.knoweb.salesmanagement.department.repository.DepartmentRepository;
import com.knoweb.salesmanagement.projectbrief.entity.ProjectBrief;
import com.knoweb.salesmanagement.projectbrief.enums.ProjectBriefStatus;
import com.knoweb.salesmanagement.projectbrief.repository.ProjectBriefRepository;
import com.knoweb.salesmanagement.technicalproject.dto.TechnicalRoutingDepartmentRequest;
import com.knoweb.salesmanagement.technicalproject.dto.TechnicalRoutingRequest;
import com.knoweb.salesmanagement.technicalproject.entity.TechnicalProject;
import com.knoweb.salesmanagement.technicalproject.enums.TechnicalProjectStatus;
import com.knoweb.salesmanagement.technicalproject.repository.TechnicalProjectRepository;
import com.knoweb.salesmanagement.technicalproject.service.TechnicalProjectInitializationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class TechnicalRoutingControllerIntegrationTest {

    private MockMvc mockMvc;

    @Autowired private WebApplicationContext context;
    @Autowired private TechnicalProjectInitializationService initializationService;
    @Autowired private ProjectBriefRepository projectBriefRepository;
    @Autowired private TechnicalProjectRepository technicalProjectRepository;
    @Autowired private DepartmentRepository departmentRepository;
    @Autowired private com.knoweb.salesmanagement.client.repository.ClientRepository clientRepository;
    @Autowired private com.knoweb.salesmanagement.lead.repository.LeadRepository leadRepository;
    @Autowired private com.knoweb.salesmanagement.productcategory.repository.ProductCategoryRepository categoryRepository;
    @Autowired private com.knoweb.salesmanagement.opportunity.repository.SalesOpportunityRepository opportunityRepository;
    @Autowired private com.knoweb.salesmanagement.approval.repository.ClientVerificationRepository clientVerificationRepository;
    @Autowired private com.knoweb.salesmanagement.approval.repository.BdmApprovalRepository bdmApprovalRepository;
    @Autowired private com.knoweb.salesmanagement.user.repository.UserRepository userRepository;
    @Autowired private com.knoweb.salesmanagement.technicalproject.repository.ProjectTeamRepository projectTeamRepository;

    private ProjectBrief pb;
    private Department devDept;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        com.knoweb.salesmanagement.user.entity.User admin = new com.knoweb.salesmanagement.user.entity.User();
        admin.setEmail("api_admin_" + UUID.randomUUID() + "@test.com");
        admin.setFirstName("API");
        admin.setLastName("Admin");
        admin.setPasswordHash("pass");
        admin = userRepository.save(admin);

        devDept = new Department();
        devDept.setName("Development API");
        devDept.setCode("DEVAPI");
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
        pb.setProjectTitle("Test API Title");
        pb.setBusinessProblem("Problem");
        pb.setRequiredSolution("Solution");
        pb.setProjectScope("Scope");
        pb.setTechnicalRequirements("Tech");
        pb.setExpectedBudget(java.math.BigDecimal.valueOf(1000));
        pb.setCurrency("USD");
        pb.setDueAt(java.time.OffsetDateTime.now().plusDays(1));
        pb.setExpectedDeadline(java.time.LocalDate.now().plusDays(10));
        pb = projectBriefRepository.save(pb);

        com.knoweb.salesmanagement.approval.entity.ClientVerification cv = new com.knoweb.salesmanagement.approval.entity.ClientVerification();
        cv.setOpportunity(pb.getOpportunity());
        cv.setProjectBrief(pb);
        cv.setProjectBriefVersionNumber(pb.getCurrentVersionNumber());
        cv.setStatus(com.knoweb.salesmanagement.approval.enums.ClientVerificationStatus.CONFIRMED);
        cv.setTokenHash("test-token-" + UUID.randomUUID());
        cv.setExpiresAt(java.time.OffsetDateTime.now().plusDays(1));
        cv.setCreatedBy(admin);
        clientVerificationRepository.saveAndFlush(cv);

        com.knoweb.salesmanagement.approval.entity.BdmApproval ba = new com.knoweb.salesmanagement.approval.entity.BdmApproval();
        ba.setOpportunity(pb.getOpportunity());
        ba.setProjectBrief(pb);
        ba.setProjectBriefVersionNumber(pb.getCurrentVersionNumber());
        ba.setStatus(com.knoweb.salesmanagement.approval.enums.BdmApprovalStatus.APPROVED);
        bdmApprovalRepository.saveAndFlush(ba);
    }

    @Test
    @WithMockUser(username = "admin@knoweb.com", authorities = {"TECHNICAL_PROJECT_ROUTE"})
    void testGetEligibleProjectBriefs_Success() throws Exception {
        mockMvc.perform(get("/api/v1/technical-routing/eligible-briefs")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void testGetEligibleProjectBriefs_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/technical-routing/eligible-briefs")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "admin@knoweb.com", authorities = {"TECHNICAL_PROJECT_ROUTE"})
    void testRouteProject_Success() throws Exception {
        TechnicalProject tp = initializationService.initializeTechnicalProject(pb.getId());

        String json = """
        {
            "departments": [
                {
                    "departmentId": "%s",
                    "requiredScope": "API Test Scope",
                    "expectedEstimateSubmissionDate": "%s"
                }
            ]
        }
        """.formatted(devDept.getId().toString(), LocalDate.now().plusDays(7).toString());

        mockMvc.perform(post("/api/v1/technical-routing/projects/{id}/route", tp.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isOk());

        TechnicalProject updatedTp = technicalProjectRepository.findById(tp.getId()).orElseThrow();
        assertThat(updatedTp.getStatus()).isEqualTo(TechnicalProjectStatus.ROUTED);
        assertThat(projectTeamRepository.count()).isEqualTo(0);
    }
    
    @Test
    @WithMockUser(username = "admin@knoweb.com", authorities = {"TECHNICAL_PROJECT_ROUTE"})
    void testRouteProject_EmptyDepartments_Returns400() throws Exception {
        TechnicalProject tp = initializationService.initializeTechnicalProject(pb.getId());

        String json = """
        {
            "departments": []
        }
        """;

        mockMvc.perform(post("/api/v1/technical-routing/projects/{id}/route", tp.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "admin@knoweb.com", authorities = {"TECHNICAL_PROJECT_ROUTE"})
    void testRouteProject_MissingScopeAndDate_Returns400() throws Exception {
        TechnicalProject tp = initializationService.initializeTechnicalProject(pb.getId());

        String json = """
        {
            "departments": [
                {
                    "departmentId": "%s"
                }
            ]
        }
        """.formatted(devDept.getId().toString());

        mockMvc.perform(post("/api/v1/technical-routing/projects/{id}/route", tp.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "admin@knoweb.com", authorities = {"TECHNICAL_PROJECT_ROUTING_REVISE"})
    void testReviseRouting_MissingReason_Returns400() throws Exception {
        TechnicalProject tp = initializationService.initializeTechnicalProject(pb.getId());

        String json = """
        {
            "departments": [
                {
                    "departmentId": "%s",
                    "requiredScope": "Updated Scope",
                    "expectedEstimateSubmissionDate": "%s"
                }
            ],
            "optimisticLockVersion": 0
        }
        """.formatted(devDept.getId().toString(), LocalDate.now().plusDays(7).toString());

        mockMvc.perform(put("/api/v1/technical-routing/projects/{id}/route", tp.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "admin@knoweb.com", authorities = {"TECHNICAL_PROJECT_ROUTE"})
    void testGetProjectDetail_MissingProject_Returns404() throws Exception {
        mockMvc.perform(get("/api/v1/technical-routing/projects/{id}", UUID.randomUUID())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "admin@knoweb.com", authorities = {"TECHNICAL_PROJECT_ROUTE"})
    void testGetProjectDetail_ValidProject_Returns200() throws Exception {
        TechnicalProject tp = initializationService.initializeTechnicalProject(pb.getId());

        mockMvc.perform(get("/api/v1/technical-routing/projects/{id}", tp.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(tp.getId().toString()));
    }

    @Test
    @WithMockUser(username = "coord@knoweb.com", authorities = {"TECHNICAL_PROJECT_ROUTE"})
    void testTechnicalCoordinatorCanAccessTechnicalProjects() throws Exception {
        mockMvc.perform(get("/api/v1/technical-routing/projects")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "admin@knoweb.com", authorities = {"ROLE_SYSTEM_ADMIN", "TECHNICAL_PROJECT_ROUTE"})
    void testSystemAdminCanAccessTechnicalProjects() throws Exception {
        mockMvc.perform(get("/api/v1/technical-routing/projects")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "hod@knoweb.com", authorities = {"ROLE_HOD", "TECHNICAL_PROJECT_READ"})
    void testHodCannotAccessTechnicalProjects() throws Exception {
        mockMvc.perform(get("/api/v1/technical-routing/projects")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    void testUnauthenticated_Returns401() throws Exception {
        mockMvc.perform(get("/api/v1/technical-routing/eligible-briefs")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "user@knoweb.com", authorities = {"SOME_OTHER_ROLE"})
    void testRouteProject_Forbidden() throws Exception {
        TechnicalProject tp = initializationService.initializeTechnicalProject(pb.getId());

        String json = """
        {
            "departments": [
                {
                    "departmentId": "%s",
                    "requiredScope": "API Test Scope",
                    "expectedEstimateSubmissionDate": "%s"
                }
            ]
        }
        """.formatted(devDept.getId().toString(), LocalDate.now().plusDays(7).toString());

        mockMvc.perform(post("/api/v1/technical-routing/projects/{id}/route", tp.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isForbidden());
    }
}
