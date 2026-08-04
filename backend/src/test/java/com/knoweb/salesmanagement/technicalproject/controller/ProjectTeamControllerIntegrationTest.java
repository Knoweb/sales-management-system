package com.knoweb.salesmanagement.technicalproject.controller;



import com.knoweb.salesmanagement.approval.entity.BdmApproval;
import com.knoweb.salesmanagement.approval.entity.ClientVerification;
import com.knoweb.salesmanagement.approval.enums.BdmApprovalStatus;
import com.knoweb.salesmanagement.approval.enums.ClientVerificationStatus;
import com.knoweb.salesmanagement.approval.repository.BdmApprovalRepository;
import com.knoweb.salesmanagement.approval.repository.ClientVerificationRepository;
import com.knoweb.salesmanagement.client.entity.Client;
import com.knoweb.salesmanagement.client.enums.ClientType;
import com.knoweb.salesmanagement.client.repository.ClientRepository;
import com.knoweb.salesmanagement.department.entity.Department;
import com.knoweb.salesmanagement.department.entity.DepartmentHead;
import com.knoweb.salesmanagement.department.repository.DepartmentHeadRepository;
import com.knoweb.salesmanagement.department.repository.DepartmentRepository;
import com.knoweb.salesmanagement.employee.entity.Employee;
import com.knoweb.salesmanagement.employee.enums.EmploymentStatus;
import com.knoweb.salesmanagement.employee.enums.EmploymentType;
import com.knoweb.salesmanagement.employee.repository.EmployeeRepository;
import com.knoweb.salesmanagement.lead.entity.Lead;
import com.knoweb.salesmanagement.lead.enums.InquirySource;
import com.knoweb.salesmanagement.lead.enums.LeadStatus;
import com.knoweb.salesmanagement.lead.repository.LeadRepository;
import com.knoweb.salesmanagement.opportunity.entity.SalesOpportunity;
import com.knoweb.salesmanagement.opportunity.enums.OpportunityStage;
import com.knoweb.salesmanagement.opportunity.repository.SalesOpportunityRepository;
import com.knoweb.salesmanagement.productcategory.entity.ProductCategory;
import com.knoweb.salesmanagement.productcategory.repository.ProductCategoryRepository;
import com.knoweb.salesmanagement.projectbrief.entity.ProjectBrief;
import com.knoweb.salesmanagement.projectbrief.enums.ProjectBriefStatus;
import com.knoweb.salesmanagement.projectbrief.repository.ProjectBriefRepository;
import com.knoweb.salesmanagement.technicalproject.dto.*;
import com.knoweb.salesmanagement.technicalproject.entity.TechnicalProject;
import com.knoweb.salesmanagement.technicalproject.entity.TechnicalProjectDepartment;
import com.knoweb.salesmanagement.technicalproject.enums.ProjectRole;
import com.knoweb.salesmanagement.technicalproject.repository.*;
import com.knoweb.salesmanagement.technicalproject.service.ProjectTeamManagementService;
import com.knoweb.salesmanagement.technicalproject.service.TechnicalProjectInitializationService;
import com.knoweb.salesmanagement.technicalproject.service.TechnicalRoutingService;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class ProjectTeamControllerIntegrationTest {

    private MockMvc mockMvc;

    @Autowired private WebApplicationContext context;
    @Autowired private ProjectTeamManagementService teamService;
    @Autowired private TechnicalProjectInitializationService initService;
    @Autowired private TechnicalRoutingService routingService;
    @Autowired private ProjectTeamRepository teamRepository;
    @Autowired private TechnicalProjectDepartmentRepository deptAssignmentRepository;
    @Autowired private DepartmentRepository departmentRepository;
    @Autowired private DepartmentHeadRepository departmentHeadRepository;
    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ClientRepository clientRepository;
    @Autowired private LeadRepository leadRepository;
    @Autowired private ProductCategoryRepository categoryRepository;
    @Autowired private SalesOpportunityRepository opportunityRepository;
    @Autowired private ProjectBriefRepository projectBriefRepository;
    @Autowired private TechnicalProjectRepository technicalProjectRepository;
    @Autowired private ClientVerificationRepository clientVerificationRepository;
    @Autowired private BdmApprovalRepository bdmApprovalRepository;

    private User adminUser;
    private Department dept;
    private Department otherDept;
    private Employee deptEmployee;
    private TechnicalProject technicalProject;
    private TechnicalProjectDepartment deptAssignment;
    private UUID teamId;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();

        // Save original context to restore later
        org.springframework.security.core.context.SecurityContext originalContext = org.springframework.security.core.context.SecurityContextHolder.getContext();
        
        adminUser = createUser("ctrl_admin_test");
        
        // Set an empty context to not mutate the original one, then set the admin user
        org.springframework.security.core.context.SecurityContext adminContext = org.springframework.security.core.context.SecurityContextHolder.createEmptyContext();
        adminContext.setAuthentication(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        adminUser.getEmail(), null,
                        List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_SYSTEM_ADMIN"),
                                new org.springframework.security.core.authority.SimpleGrantedAuthority("TECHNICAL_PROJECT_ROUTE"),
                                new org.springframework.security.core.authority.SimpleGrantedAuthority("PROJECT_TEAM_MANAGE"))));
        
        org.springframework.security.core.context.SecurityContextHolder.setContext(adminContext);

        User hodUser = createUser("ctrl_hod_test@knoweb.lk");

        dept      = createDepartment("CtrlEng-" + UUID.randomUUID().toString().substring(0, 4), "CE-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        otherDept = createDepartment("CtrlMkt-" + UUID.randomUUID().toString().substring(0, 4), "CM-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());

        deptEmployee = createEmployee(dept, null, "Dev", "CTRL-E-" + UUID.randomUUID().toString().substring(0, 4));

        Employee hodEmp = createEmployee(dept, hodUser, "HOD", "CTRL-H-" + UUID.randomUUID().toString().substring(0, 4));
        DepartmentHead head = new DepartmentHead();
        head.setDepartment(dept);
        head.setEmployee(hodEmp);
        head.setActive(true);
        head.setAssignedBy(adminUser);
        departmentHeadRepository.save(head);

        technicalProject = createRoutedProject(dept);
        deptAssignment = deptAssignmentRepository.findByTechnicalProjectId(technicalProject.getId()).get(0);

        // Pre-create a team via the service so controller tests have a team to work with
        teamId = teamService.createOrGetTeam(deptAssignment.getId(), "Ctrl Team").getId();
        
        // Restore original context so @WithMockUser works as expected for tests
        org.springframework.security.core.context.SecurityContextHolder.setContext(originalContext);
    }

    // -----------------------------------------------------------------------
    // GET /api/v1/departments/{deptId}/assigned-projects
    // -----------------------------------------------------------------------

    @Test
    @WithMockUser(authorities = {"ROLE_SYSTEM_ADMIN", "DEPARTMENT_READ", "PROJECT_TEAM_READ"})
    void getDeptAssignedProjects_asAdmin_200() throws Exception {
        mockMvc.perform(get("/api/v1/departments/{deptId}/assigned-projects", dept.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void getDeptAssignedProjects_unauthenticated_401() throws Exception {
        mockMvc.perform(get("/api/v1/departments/{deptId}/assigned-projects", dept.getId()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(authorities = {}) // no PROJECT_TEAM_READ
    void getDeptAssignedProjects_noPermission_403() throws Exception {
        mockMvc.perform(get("/api/v1/departments/{deptId}/assigned-projects", dept.getId()))
                .andExpect(status().isForbidden());
    }

    // -----------------------------------------------------------------------
    // GET /api/v1/employees/availability
    // -----------------------------------------------------------------------

    @Test
    @WithMockUser(authorities = {"EMPLOYEE_ALLOCATION_READ", "ROLE_SYSTEM_ADMIN", "DEPARTMENT_READ"})
    void availabilitySearch_validRequest_200() throws Exception {
        mockMvc.perform(get("/api/v1/employees/availability")
                        .param("departmentId", dept.getId().toString())
                        .param("startDate", LocalDate.now().toString())
                        .param("endDate", LocalDate.now().plusDays(30).toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void availabilitySearch_unauthenticated_401() throws Exception {
        mockMvc.perform(get("/api/v1/employees/availability")
                        .param("startDate", LocalDate.now().toString())
                        .param("endDate", LocalDate.now().plusDays(30).toString()))
                .andExpect(status().isUnauthorized());
    }


    // -----------------------------------------------------------------------
    // POST /api/v1/project-teams/department-assignments/{tpdId}
    // -----------------------------------------------------------------------

    @Test
    @WithMockUser(authorities = {"PROJECT_TEAM_MANAGE", "ROLE_SYSTEM_ADMIN", "DEPARTMENT_READ"})
    void createTeam_asAdmin_201() throws Exception {
        // Create a second project to have a fresh TPD
        TechnicalProject tp2 = createRoutedProject(dept);
        TechnicalProjectDepartment tpd2 = deptAssignmentRepository.findByTechnicalProjectId(tp2.getId()).get(0);

        mockMvc.perform(post("/api/v1/project-teams/department-assignments/{tpdId}", tpd2.getId())
                        .param("teamName", "New Team"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    @Test
    void createTeam_unauthenticated_401() throws Exception {
        mockMvc.perform(post("/api/v1/project-teams/department-assignments/{tpdId}", deptAssignment.getId()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(authorities = {"PROJECT_TEAM_READ"})
    void createTeam_noPermission_403() throws Exception {
        mockMvc.perform(post("/api/v1/project-teams/department-assignments/{tpdId}", deptAssignment.getId()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = {"PROJECT_TEAM_MANAGE", "ROLE_SYSTEM_ADMIN", "DEPARTMENT_READ"})
    void createTeam_notFound_404() throws Exception {
        mockMvc.perform(post("/api/v1/project-teams/department-assignments/{tpdId}", UUID.randomUUID()))
                .andExpect(status().isNotFound());
    }

    // -----------------------------------------------------------------------
    // GET /api/v1/project-teams/{teamId}
    // -----------------------------------------------------------------------

    @Test
    @WithMockUser(authorities = {"PROJECT_TEAM_READ", "ROLE_SYSTEM_ADMIN", "DEPARTMENT_READ"})
    void getTeamDetail_asAdmin_200() throws Exception {
        mockMvc.perform(get("/api/v1/project-teams/{teamId}", teamId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(teamId.toString()))
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    @Test
    void getTeamDetail_unauthenticated_401() throws Exception {
        mockMvc.perform(get("/api/v1/project-teams/{teamId}", teamId))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(authorities = {"PROJECT_TEAM_READ", "ROLE_SYSTEM_ADMIN", "DEPARTMENT_READ"})
    void getTeamDetail_notFound_404() throws Exception {
        mockMvc.perform(get("/api/v1/project-teams/{teamId}", UUID.randomUUID()))
                .andExpect(status().isNotFound());
    }

    // -----------------------------------------------------------------------
    // POST /api/v1/project-teams/{teamId}/members
    // -----------------------------------------------------------------------

    @Test
    @WithMockUser(authorities = {"EMPLOYEE_ALLOCATION_MANAGE", "ROLE_SYSTEM_ADMIN", "DEPARTMENT_READ"})
    void addMember_validRequest_201() throws Exception {
        AddTeamMemberRequest req = new AddTeamMemberRequest();
        req.setEmployeeId(deptEmployee.getId());
        req.setProjectRole(ProjectRole.PROJECT_ENGINEER);
        req.setAllocationStartDate(LocalDate.now());
        req.setAllocationEndDate(LocalDate.now().plusDays(20));
        req.setAssignedHours(new BigDecimal("40"));

        mockMvc.perform(post("/api/v1/project-teams/{teamId}/members", teamId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.members").isArray())
                .andExpect(jsonPath("$.members[0].employeeId").value(deptEmployee.getId().toString()));
    }

    @Test
    void addMember_unauthenticated_401() throws Exception {
        AddTeamMemberRequest addReq = new AddTeamMemberRequest();
        addReq.setEmployeeId(deptEmployee.getId());
        addReq.setProjectRole(ProjectRole.PROJECT_ENGINEER);
        addReq.setAllocationStartDate(LocalDate.now());
        addReq.setAllocationEndDate(LocalDate.now().plusDays(20));
        addReq.setAssignedHours(new BigDecimal("40"));

        mockMvc.perform(post("/api/v1/project-teams/{teamId}/members", teamId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(addReq)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(authorities = {"EMPLOYEE_ALLOCATION_MANAGE", "ROLE_SYSTEM_ADMIN", "DEPARTMENT_READ"})
    void addMember_invalidEmployee_409() throws Exception {
        AddTeamMemberRequest req = new AddTeamMemberRequest();
        req.setEmployeeId(UUID.randomUUID()); // non-existent
        req.setProjectRole(ProjectRole.ASSISTANT);
        req.setAllocationStartDate(LocalDate.now());
        req.setAllocationEndDate(LocalDate.now().plusDays(10));
        req.setAssignedHours(new BigDecimal("20"));

        mockMvc.perform(post("/api/v1/project-teams/{teamId}/members", teamId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(req)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(authorities = {"EMPLOYEE_ALLOCATION_MANAGE", "ROLE_SYSTEM_ADMIN", "DEPARTMENT_READ"})
    void addMember_wrongDept_409() throws Exception {
        Employee wrongEmp = createEmployee(otherDept, null, "Mktg", "CTRL-W-" + UUID.randomUUID().toString().substring(0, 4));

        AddTeamMemberRequest req = new AddTeamMemberRequest();
        req.setEmployeeId(wrongEmp.getId());
        req.setProjectRole(ProjectRole.ASSISTANT);
        req.setAllocationStartDate(LocalDate.now());
        req.setAllocationEndDate(LocalDate.now().plusDays(10));
        req.setAssignedHours(new BigDecimal("20"));

        mockMvc.perform(post("/api/v1/project-teams/{teamId}/members", teamId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(req)))
                .andExpect(status().isConflict());
    }

    // -----------------------------------------------------------------------
    // DELETE /api/v1/project-teams/{teamId}/members/{memberId}
    // -----------------------------------------------------------------------

    @Test
    @WithMockUser(authorities = {"EMPLOYEE_ALLOCATION_MANAGE", "ROLE_SYSTEM_ADMIN", "DEPARTMENT_READ"})
    void removeMember_200() throws Exception {
        // First add a member
        AddTeamMemberRequest addReq = new AddTeamMemberRequest();
        addReq.setEmployeeId(deptEmployee.getId());
        addReq.setProjectRole(ProjectRole.PROJECT_ENGINEER);
        addReq.setAllocationStartDate(LocalDate.now());
        addReq.setAllocationEndDate(LocalDate.now().plusDays(20));
        addReq.setAssignedHours(new BigDecimal("40"));

        String addResult = mockMvc.perform(post("/api/v1/project-teams/{teamId}/members", teamId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(addReq)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String memberIdStr = com.jayway.jsonpath.JsonPath.read(addResult, "$.members[0].id");
        UUID memberId = UUID.fromString(memberIdStr);

        mockMvc.perform(delete("/api/v1/project-teams/{teamId}/members/{memberId}", teamId, memberId))
                .andExpect(status().isOk());
    }

    // -----------------------------------------------------------------------
    // POST /api/v1/project-teams/{teamId}/mark-ready
    // -----------------------------------------------------------------------

    @Test
    @WithMockUser(authorities = {"PROJECT_TEAM_MANAGE", "EMPLOYEE_ALLOCATION_MANAGE", "ROLE_SYSTEM_ADMIN", "DEPARTMENT_READ"})
    void markReady_withMember_200() throws Exception {
        // Add a member first
        AddTeamMemberRequest addReq = new AddTeamMemberRequest();
        addReq.setEmployeeId(deptEmployee.getId());
        addReq.setProjectRole(ProjectRole.PROJECT_ENGINEER);
        addReq.setAllocationStartDate(LocalDate.now());
        addReq.setAllocationEndDate(LocalDate.now().plusDays(20));
        addReq.setAssignedHours(new BigDecimal("40"));

        mockMvc.perform(post("/api/v1/project-teams/{teamId}/members", teamId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(addReq)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/project-teams/{teamId}/mark-ready", teamId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("READY"));
    }

    @Test
    @WithMockUser(authorities = {"PROJECT_TEAM_MANAGE", "ROLE_SYSTEM_ADMIN", "DEPARTMENT_READ"})
    void markReady_noMembers_409() throws Exception {
        mockMvc.perform(post("/api/v1/project-teams/{teamId}/mark-ready", teamId))
                .andExpect(status().isConflict());
    }

    @Test
    void markReady_unauthenticated_401() throws Exception {
        mockMvc.perform(post("/api/v1/project-teams/{teamId}/mark-ready", teamId))
                .andExpect(status().isUnauthorized());
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    private String toJson(AddTeamMemberRequest req) {
        return "{" +
                "\"employeeId\":\"" + req.getEmployeeId() + "\"," +
                "\"projectRole\":\"" + req.getProjectRole() + "\"," +
                "\"allocationStartDate\":\"" + req.getAllocationStartDate() + "\"," +
                "\"allocationEndDate\":\"" + req.getAllocationEndDate() + "\"," +
                "\"assignedHours\":" + req.getAssignedHours() + "," +
                "\"overrideRequested\":" + req.isOverrideRequested() + "," +
                "\"overrideReason\":" + (req.getOverrideReason() != null ? "\"" + req.getOverrideReason() + "\"" : "null") +
                "}";
    }

    private User createUser(String prefix) {
        User u = new User();
        u.setEmail(prefix + "@knoweb.lk");
        u.setFirstName("Test");
        u.setLastName("User");
        u.setPasswordHash("hash");
        return userRepository.save(u);
    }

    private Department createDepartment(String name, String code) {
        Department d = new Department();
        d.setName(name);
        d.setCode(code);
        d.setActive(true);
        return departmentRepository.save(d);
    }

    private Employee createEmployee(Department dept, User user, String jobTitle, String empNumber) {
        Employee e = new Employee();
        e.setDepartment(dept);
        e.setUser(user);
        e.setFirstName("Test");
        e.setLastName("Employee");
        e.setEmployeeNumber(empNumber);
        e.setJobTitle(jobTitle);
        e.setEmploymentType(EmploymentType.FULL_TIME);
        e.setEmploymentStatus(EmploymentStatus.ACTIVE);
        e.setWeeklyCapacityHours(new BigDecimal("40.00"));
        return employeeRepository.save(e);
    }

    private TechnicalProject createRoutedProject(Department targetDept) {
        Client client = new Client();
        client.setName("Cl-" + UUID.randomUUID().toString().substring(0, 4));
        client.setClientType(ClientType.COMPANY);
        client = clientRepository.save(client);

        Lead lead = new Lead();
        lead.setTitle("Ld-" + UUID.randomUUID().toString().substring(0, 4));
        lead.setClient(client);
        lead.setInquirySource(InquirySource.WEBSITE);
        lead.setStatus(LeadStatus.NEW);
        lead = leadRepository.save(lead);

        ProductCategory cat = new ProductCategory();
        cat.setCode("C-" + UUID.randomUUID().toString().substring(0, 4));
        cat.setName("Cat-" + UUID.randomUUID().toString().substring(0, 4));
        cat = categoryRepository.save(cat);

        SalesOpportunity opp = new SalesOpportunity();
        opp.setOpportunityNumber("OPP-" + UUID.randomUUID().toString().substring(0, 8));
        opp.setTitle("Opp");
        opp.setClient(client);
        opp.setLead(lead);
        opp.setProductCategory(cat);
        opp.setStage(OpportunityStage.QUALIFIED);
        opp.setEstimatedValue(BigDecimal.valueOf(10000));
        opp.setExpectedCloseDate(LocalDate.now().plusDays(30));
        opp = opportunityRepository.save(opp);

        ProjectBrief pb = new ProjectBrief();
        pb.setOpportunity(opp);
        pb.setStatus(ProjectBriefStatus.CLIENT_VERIFIED);
        pb.setProjectTitle("Ctrl Test " + UUID.randomUUID().toString().substring(0, 4));
        pb.setBusinessProblem("Problem");
        pb.setRequiredSolution("Solution");
        pb.setProjectScope("Scope");
        pb.setTechnicalRequirements("Tech");
        pb.setExpectedBudget(BigDecimal.valueOf(1000));
        pb.setCurrency("USD");
        pb.setDueAt(OffsetDateTime.now().plusDays(1));
        pb.setExpectedDeadline(LocalDate.now().plusDays(10));
        pb = projectBriefRepository.save(pb);

        ClientVerification cv = new ClientVerification();
        cv.setOpportunity(opp);
        cv.setProjectBrief(pb);
        cv.setProjectBriefVersionNumber(pb.getCurrentVersionNumber());
        cv.setStatus(ClientVerificationStatus.CONFIRMED);
        cv.setTokenHash("tok-" + UUID.randomUUID());
        cv.setExpiresAt(OffsetDateTime.now().plusDays(1));
        cv.setCreatedBy(adminUser);
        clientVerificationRepository.saveAndFlush(cv);

        BdmApproval ba = new BdmApproval();
        ba.setOpportunity(opp);
        ba.setProjectBrief(pb);
        ba.setProjectBriefVersionNumber(pb.getCurrentVersionNumber());
        ba.setStatus(BdmApprovalStatus.APPROVED);
        bdmApprovalRepository.saveAndFlush(ba);

        // Save original context to restore later
        org.springframework.security.core.context.SecurityContext originalContext = org.springframework.security.core.context.SecurityContextHolder.getContext();
        
        // Set an empty context to not mutate the original one, then set the admin user
        org.springframework.security.core.context.SecurityContext adminContext = org.springframework.security.core.context.SecurityContextHolder.createEmptyContext();
        adminContext.setAuthentication(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        adminUser.getEmail(), null,
                        List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_SYSTEM_ADMIN"),
                                new org.springframework.security.core.authority.SimpleGrantedAuthority("TECHNICAL_PROJECT_ROUTE"),
                                new org.springframework.security.core.authority.SimpleGrantedAuthority("PROJECT_TEAM_MANAGE"))));
        
        org.springframework.security.core.context.SecurityContextHolder.setContext(adminContext);

        TechnicalProject tp = initService.initializeTechnicalProject(pb.getId());

        TechnicalRoutingRequest routingReq = new TechnicalRoutingRequest();
        TechnicalRoutingDepartmentRequest dReq = new TechnicalRoutingDepartmentRequest();
        dReq.setDepartmentId(targetDept.getId());
        dReq.setRequiredScope("Full scope");
        dReq.setExpectedEstimateSubmissionDate(LocalDate.now().plusDays(14));
        routingReq.setDepartments(List.of(dReq));
        routingService.routeProject(tp.getId(), routingReq);
        
        // Restore original context
        org.springframework.security.core.context.SecurityContextHolder.setContext(originalContext);

        return technicalProjectRepository.findById(tp.getId()).orElseThrow();
    }
}
