package com.knoweb.salesmanagement.technicalproject.service;

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
import com.knoweb.salesmanagement.technicalproject.enums.*;
import com.knoweb.salesmanagement.technicalproject.repository.*;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class ProjectTeamManagementServiceIntegrationTest {

    @Autowired private ProjectTeamManagementService teamService;
    @Autowired private TechnicalProjectInitializationService initService;
    @Autowired private TechnicalRoutingService routingService;
    @Autowired private ProjectTeamRepository teamRepository;
    @Autowired private ProjectTeamMemberRepository memberRepository;
    @Autowired private EmployeeAllocationRepository allocationRepository;
    @Autowired private TechnicalProjectRepository technicalProjectRepository;
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
    @Autowired private ClientVerificationRepository clientVerificationRepository;
    @Autowired private BdmApprovalRepository bdmApprovalRepository;

    // Test fixtures
    private User adminUser;
    private User hodUser;
    private Department dept;
    private Department otherDept;
    private Employee hodEmployee;
    private Employee deptEmployee;
    private Employee otherDeptEmployee;
    private TechnicalProject technicalProject;
    private TechnicalProjectDepartment deptAssignment;

    @BeforeEach
    void setUp() {
        // ---- Users ----
        adminUser = createUser("admin_team_" + UUID.randomUUID());
        hodUser   = createUser("hod_team_"   + UUID.randomUUID());

        // ---- Departments ----
        dept      = createDepartment("Eng-" + UUID.randomUUID().toString().substring(0, 4), "ENG-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        otherDept = createDepartment("Mkt-" + UUID.randomUUID().toString().substring(0, 4), "MKT-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());

        // ---- Employees ----
        hodEmployee       = createEmployee(dept,      hodUser,  "HOD",    "EMP-H-" + UUID.randomUUID().toString().substring(0, 4));
        deptEmployee      = createEmployee(dept,      null,     "Eng",    "EMP-E-" + UUID.randomUUID().toString().substring(0, 4));
        otherDeptEmployee = createEmployee(otherDept, null,     "Mktg",   "EMP-M-" + UUID.randomUUID().toString().substring(0, 4));

        // Make hodEmployee the active HOD of dept
        DepartmentHead head = new DepartmentHead();
        head.setDepartment(dept);
        head.setEmployee(hodEmployee);
        head.setActive(true);
        head.setAssignedBy(adminUser);
        departmentHeadRepository.save(head);

        // ---- Technical Project ----
        technicalProject = createRoutedProject();

        // Retrieve the department assignment
        deptAssignment = deptAssignmentRepository.findByTechnicalProjectId(technicalProject.getId()).get(0);
    }

    // =========================================================================
    // HOD queue
    // =========================================================================

    @Test
    void hodQueue_ownDept_returnsAssignedProjects() {
        authenticateAsHod();
        Page<AssignedProjectSummaryDTO> page = teamService.getAssignedProjects(dept.getId(), PageRequest.of(0, 10));
        assertThat(page.getContent()).hasSize(1);
        assertThat(page.getContent().get(0).getTechnicalProjectId()).isEqualTo(technicalProject.getId());
    }

    @Test
    void hodQueue_otherDept_throwsAccessDenied() {
        authenticateAsHod();
        assertThatThrownBy(() -> teamService.getAssignedProjects(otherDept.getId(), PageRequest.of(0, 10)))
                .isInstanceOf(AccessDeniedException.class);
    }

    // =========================================================================
    // Availability search
    // =========================================================================

    @Test
    void availabilitySearch_byDept_returnsActiveEmployees() {
        authenticateAsAdmin();
        List<EmployeeAvailabilityDTO> result = teamService.searchAvailability(
                dept.getId(),
                LocalDate.now(),
                LocalDate.now().plusDays(30),
                null, null);
        // hodEmployee and deptEmployee are in dept
        assertThat(result).hasSizeGreaterThanOrEqualTo(2);
        assertThat(result.stream().map(EmployeeAvailabilityDTO::getEmployeeId))
                .contains(deptEmployee.getId());
    }

    @Test
    void availabilitySearch_invalidDateRange_throwsIllegalArgument() {
        authenticateAsAdmin();
        assertThatThrownBy(() -> teamService.searchAvailability(
                dept.getId(),
                LocalDate.now().plusDays(10),
                LocalDate.now(),
                null, null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    // =========================================================================
    // Team creation
    // =========================================================================

    @Test
    void createTeam_ownDept_succeeds() {
        authenticateAsHod();
        ProjectTeamDetailDTO dto = teamService.createOrGetTeam(deptAssignment.getId(), "My Team");
        assertThat(dto.getStatus()).isEqualTo(ProjectTeamStatus.DRAFT);
        assertThat(dto.getDepartmentName()).isEqualTo(dept.getName());

        // formation status updated to IN_PROGRESS
        TechnicalProjectDepartment updated = deptAssignmentRepository.findById(deptAssignment.getId()).orElseThrow();
        assertThat(updated.getFormationStatus()).isEqualTo(TeamFormationStatus.IN_PROGRESS);
    }

    @Test
    void createTeam_otherDept_throwsAccessDenied() {
        authenticateAsHod();
        // Create a project routed to otherDept
        TechnicalProject otherTp = createRoutedProjectForDept(otherDept);
        TechnicalProjectDepartment otherTpd = deptAssignmentRepository.findByTechnicalProjectId(otherTp.getId()).get(0);

        assertThatThrownBy(() -> teamService.createOrGetTeam(otherTpd.getId(), "Hack"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void createTeam_idempotent_returnsSameTeam() {
        authenticateAsHod();
        ProjectTeamDetailDTO first  = teamService.createOrGetTeam(deptAssignment.getId(), "Team A");
        ProjectTeamDetailDTO second = teamService.createOrGetTeam(deptAssignment.getId(), "Team B");
        assertThat(first.getId()).isEqualTo(second.getId());
    }

    // =========================================================================
    // Add member
    // =========================================================================

    @Test
    void addMember_validEmployee_succeeds() {
        authenticateAsHod();
        ProjectTeamDetailDTO team = teamService.createOrGetTeam(deptAssignment.getId(), "T1");

        AddTeamMemberRequest req = buildAddRequest(deptEmployee, LocalDate.now(), LocalDate.now().plusDays(30), new BigDecimal("80"));
        ProjectTeamDetailDTO updated = teamService.addMember(team.getId(), req);

        assertThat(updated.getMembers()).hasSize(1);
        assertThat(updated.getMembers().get(0).getEmployeeId()).isEqualTo(deptEmployee.getId());

        // Allocation created
        assertThat(allocationRepository.findByProjectTeamIdAndStatus(team.getId(), EmployeeAllocationStatus.ACTIVE)).hasSize(1);
    }

    @Test
    void addMember_wrongDept_throwsConflict() {
        authenticateAsHod();
        ProjectTeamDetailDTO team = teamService.createOrGetTeam(deptAssignment.getId(), "T2");

        AddTeamMemberRequest req = buildAddRequest(otherDeptEmployee, LocalDate.now(), LocalDate.now().plusDays(30), new BigDecimal("80"));
        assertThatThrownBy(() -> teamService.addMember(team.getId(), req))
                .isInstanceOf(com.knoweb.salesmanagement.common.exception.ResourceConflictException.class)
                .hasMessageContaining("does not belong to department");
    }

    @Test
    void addMember_invalidDateRange_throwsIllegalArgument() {
        authenticateAsHod();
        ProjectTeamDetailDTO team = teamService.createOrGetTeam(deptAssignment.getId(), "T3");

        AddTeamMemberRequest req = buildAddRequest(deptEmployee, LocalDate.now().plusDays(10), LocalDate.now(), new BigDecimal("80"));
        assertThatThrownBy(() -> teamService.addMember(team.getId(), req))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void addMember_negativeHours_throwsIllegalArgument() {
        authenticateAsHod();
        ProjectTeamDetailDTO team = teamService.createOrGetTeam(deptAssignment.getId(), "T4");

        AddTeamMemberRequest req = buildAddRequest(deptEmployee, LocalDate.now(), LocalDate.now().plusDays(10), new BigDecimal("-5"));
        assertThatThrownBy(() -> teamService.addMember(team.getId(), req))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void addMember_duplicate_throwsConflict() {
        authenticateAsHod();
        ProjectTeamDetailDTO team = teamService.createOrGetTeam(deptAssignment.getId(), "T5");

        AddTeamMemberRequest req = buildAddRequest(deptEmployee, LocalDate.now(), LocalDate.now().plusDays(30), new BigDecimal("80"));
        teamService.addMember(team.getId(), req);

        // Try adding same employee again
        assertThatThrownBy(() -> teamService.addMember(team.getId(), req))
                .isInstanceOf(com.knoweb.salesmanagement.common.exception.ResourceConflictException.class)
                .hasMessageContaining("already an active member");
    }

    // =========================================================================
    // Override logic
    // =========================================================================

    @Test
    void addMember_capacityExceeded_withOverridePermission_succeeds() {
        authenticateAsAdminWithOverride();
        ProjectTeamDetailDTO team = teamService.createOrGetTeam(deptAssignment.getId(), "T_override");

        // First: add member with full capacity (40h/week * 4 weeks = max)
        AddTeamMemberRequest req1 = buildAddRequest(deptEmployee, LocalDate.now(), LocalDate.now().plusDays(6), new BigDecimal("40"));
        teamService.addMember(team.getId(), req1);

        // Force a second project to put them over capacity: create a 2nd project team routed to same dept
        Department dept2 = createDepartment("Eng2-" + UUID.randomUUID().toString().substring(0,4), "E2-" + UUID.randomUUID().toString().substring(0,4).toUpperCase());
        // We can simulate over-allocation by trying a large hours number on the same employee in another project
        // In this test, just verify the override path: request hours > remaining capacity
        TechnicalProject tp2 = createRoutedProjectForDept(dept);
        TechnicalProjectDepartment tpd2 = deptAssignmentRepository.findByTechnicalProjectId(tp2.getId()).get(0);
        ProjectTeamDetailDTO team2 = teamService.createOrGetTeam(tpd2.getId(), "T_other");

        // Now add same employee with very large hours and override
        AddTeamMemberRequest overrideReq = buildAddRequest(deptEmployee, LocalDate.now(), LocalDate.now().plusDays(6), new BigDecimal("1000"));
        overrideReq.setOverrideRequested(true);
        overrideReq.setOverrideReason("Critical project staffing need");
        ProjectTeamDetailDTO result = teamService.addMember(team2.getId(), overrideReq);
        assertThat(result.getMembers().stream().anyMatch(m -> m.isOverrideFlag())).isTrue();
    }

    @Test
    void addMember_capacityExceeded_noOverridePermission_throwsConflict() {
        authenticateAsHod(); // HOD does not have EMPLOYEE_ALLOCATION_OVERRIDE
        ProjectTeamDetailDTO team = teamService.createOrGetTeam(deptAssignment.getId(), "T_nooverride");

        // Add employee first to exhaust capacity
        AddTeamMemberRequest req1 = buildAddRequest(deptEmployee, LocalDate.now(), LocalDate.now().plusDays(6), new BigDecimal("40"));
        teamService.addMember(team.getId(), req1);

        // Try to add to another team with huge hours (same date range)
        TechnicalProject tp2 = createRoutedProjectForDept(dept);
        TechnicalProjectDepartment tpd2 = deptAssignmentRepository.findByTechnicalProjectId(tp2.getId()).get(0);

        // Temporarily switch to global access to create team2, then back to HOD
        authenticateAsAdmin();
        ProjectTeamDetailDTO team2 = teamService.createOrGetTeam(tpd2.getId(), "T_other2");
        authenticateAsHod();

        AddTeamMemberRequest overReq = buildAddRequest(deptEmployee, LocalDate.now(), LocalDate.now().plusDays(6), new BigDecimal("1000"));
        overReq.setOverrideRequested(true);
        overReq.setOverrideReason("Needs override");
        // HOD lacks EMPLOYEE_ALLOCATION_OVERRIDE → AccessDeniedException
        assertThatThrownBy(() -> teamService.addMember(team2.getId(), overReq))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void addMember_overrideRequested_blankReason_throwsIllegalArgument() {
        authenticateAsAdminWithOverride();
        ProjectTeamDetailDTO team = teamService.createOrGetTeam(deptAssignment.getId(), "T_blank_reason");

        // Add first to exhaust capacity
        AddTeamMemberRequest req1 = buildAddRequest(deptEmployee, LocalDate.now(), LocalDate.now().plusDays(6), new BigDecimal("40"));
        teamService.addMember(team.getId(), req1);

        TechnicalProject tp2 = createRoutedProjectForDept(dept);
        TechnicalProjectDepartment tpd2 = deptAssignmentRepository.findByTechnicalProjectId(tp2.getId()).get(0);
        ProjectTeamDetailDTO team2 = teamService.createOrGetTeam(tpd2.getId(), "T_other3");

        AddTeamMemberRequest badReq = buildAddRequest(deptEmployee, LocalDate.now(), LocalDate.now().plusDays(6), new BigDecimal("1000"));
        badReq.setOverrideRequested(true);
        badReq.setOverrideReason("   "); // blank
        assertThatThrownBy(() -> teamService.addMember(team2.getId(), badReq))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("overrideReason");
    }

    // =========================================================================
    // Update member allocation
    // =========================================================================

    @Test
    void updateMember_succeeds_cancelsPreviousAllocation() {
        authenticateAsHod();
        ProjectTeamDetailDTO team = teamService.createOrGetTeam(deptAssignment.getId(), "T_update");

        AddTeamMemberRequest addReq = buildAddRequest(deptEmployee, LocalDate.now(), LocalDate.now().plusDays(30), new BigDecimal("80"));
        ProjectTeamDetailDTO after = teamService.addMember(team.getId(), addReq);

        UUID memberId = after.getMembers().get(0).getId();

        UpdateMemberAllocationRequest updReq = new UpdateMemberAllocationRequest();
        updReq.setProjectRole(ProjectRole.PROJECT_ENGINEER);
        updReq.setAllocationStartDate(LocalDate.now());
        updReq.setAllocationEndDate(LocalDate.now().plusDays(15));
        updReq.setAssignedHours(new BigDecimal("40"));
        updReq.setPrimaryMember(false);

        teamService.markTeamReady(team.getId());

        ProjectTeamDetailDTO updated = teamService.updateMemberAllocation(team.getId(), memberId, updReq);
        assertThat(updated.getMembers().get(0).getAssignedHours()).isEqualByComparingTo(new BigDecimal("40"));

        // Previous allocation was cancelled
        long activeAllocs = allocationRepository.findByProjectTeamIdAndStatus(team.getId(), EmployeeAllocationStatus.ACTIVE).size();
        assertThat(activeAllocs).isEqualTo(1);
    }

    @Test
    void updateMember_notFound_throws404() {
        authenticateAsHod();
        ProjectTeamDetailDTO team = teamService.createOrGetTeam(deptAssignment.getId(), "T_notfound");
        
        AddTeamMemberRequest addReq = buildAddRequest(deptEmployee, LocalDate.now(), LocalDate.now().plusDays(5), new BigDecimal("10"));
        teamService.addMember(team.getId(), addReq);

        UpdateMemberAllocationRequest req = new UpdateMemberAllocationRequest();
        req.setProjectRole(ProjectRole.ASSISTANT);
        req.setAllocationStartDate(LocalDate.now());
        req.setAllocationEndDate(LocalDate.now().plusDays(5));
        req.setAssignedHours(new BigDecimal("8"));

        teamService.markTeamReady(team.getId());

        assertThatThrownBy(() -> teamService.updateMemberAllocation(team.getId(), UUID.randomUUID(), req))
                .isInstanceOf(com.knoweb.salesmanagement.common.exception.ResourceNotFoundException.class);
    }

    // =========================================================================
    // Remove member
    // =========================================================================

    @Test
    void removeMember_cancelsAllocation() {
        authenticateAsHod();
        ProjectTeamDetailDTO team = teamService.createOrGetTeam(deptAssignment.getId(), "T_remove");

        AddTeamMemberRequest req = buildAddRequest(deptEmployee, LocalDate.now(), LocalDate.now().plusDays(20), new BigDecimal("50"));
        ProjectTeamDetailDTO after = teamService.addMember(team.getId(), req);
        UUID memberId = after.getMembers().get(0).getId();

        teamService.removeMember(team.getId(), memberId);

        // Allocation cancelled
        assertThat(allocationRepository.findByProjectTeamIdAndStatus(team.getId(), EmployeeAllocationStatus.ACTIVE)).isEmpty();

        // Member status is REMOVED
        assertThat(memberRepository.findById(memberId).orElseThrow().getStatus()).isEqualTo(ProjectTeamMemberStatus.REMOVED);
    }

    @Test
    void removeMember_alreadyRemoved_throwsConflict() {
        authenticateAsHod();
        ProjectTeamDetailDTO team = teamService.createOrGetTeam(deptAssignment.getId(), "T_double_remove");

        AddTeamMemberRequest req = buildAddRequest(deptEmployee, LocalDate.now(), LocalDate.now().plusDays(20), new BigDecimal("40"));
        ProjectTeamDetailDTO after = teamService.addMember(team.getId(), req);
        UUID memberId = after.getMembers().get(0).getId();

        teamService.removeMember(team.getId(), memberId);
        assertThatThrownBy(() -> teamService.removeMember(team.getId(), memberId))
                .isInstanceOf(com.knoweb.salesmanagement.common.exception.ResourceConflictException.class)
                .hasMessageContaining("already removed");
    }

    // =========================================================================
    // Mark ready
    // =========================================================================

    @Test
    void markReady_noMembers_throwsConflict() {
        authenticateAsHod();
        ProjectTeamDetailDTO team = teamService.createOrGetTeam(deptAssignment.getId(), "T_empty");
        assertThatThrownBy(() -> teamService.markTeamReady(team.getId()))
                .isInstanceOf(com.knoweb.salesmanagement.common.exception.ResourceConflictException.class)
                .hasMessageContaining("at least one active member");
    }

    @Test
    void markReady_withMember_singleDept_setsProjectTeamReady() {
        authenticateAsHod();
        ProjectTeamDetailDTO team = teamService.createOrGetTeam(deptAssignment.getId(), "T_ready");

        AddTeamMemberRequest req = buildAddRequest(deptEmployee, LocalDate.now(), LocalDate.now().plusDays(20), new BigDecimal("40"));
        teamService.addMember(team.getId(), req);

        ProjectTeamDetailDTO ready = teamService.markTeamReady(team.getId());
        assertThat(ready.getStatus()).isEqualTo(ProjectTeamStatus.READY);
        assertThat(ready.getFormationStatus()).isEqualTo(TeamFormationStatus.COMPLETED);

        // Project should be TEAM_READY (only 1 dept)
        TechnicalProject updated = technicalProjectRepository.findById(technicalProject.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(TechnicalProjectStatus.TEAM_READY);
    }

    @Test
    void markReady_multiDept_partialCompletion_setsTeamFormationInProgress() {
        authenticateAsAdmin();

        // Route to a second department
        TechnicalRoutingRequest revisionReq = new TechnicalRoutingRequest();
        TechnicalRoutingDepartmentRequest d1 = new TechnicalRoutingDepartmentRequest();
        d1.setDepartmentId(dept.getId());
        d1.setRequiredScope("Scope 1");
        d1.setExpectedEstimateSubmissionDate(LocalDate.now().plusDays(14));
        TechnicalRoutingDepartmentRequest d2 = new TechnicalRoutingDepartmentRequest();
        d2.setDepartmentId(otherDept.getId());
        d2.setRequiredScope("Scope 2");
        d2.setExpectedEstimateSubmissionDate(LocalDate.now().plusDays(14));

        // Create a fresh project routed to both depts
        TechnicalProject freshTp = createRoutedProjectForDepts(dept, otherDept);

        List<TechnicalProjectDepartment> assignments = deptAssignmentRepository.findByTechnicalProjectId(freshTp.getId());
        TechnicalProjectDepartment deptTpd = assignments.stream()
                .filter(a -> a.getDepartment().getId().equals(dept.getId())).findFirst().orElseThrow();

        // Create team for dept only and mark ready
        authenticateAsHod();
        ProjectTeamDetailDTO team = teamService.createOrGetTeam(deptTpd.getId(), "Partial");
        AddTeamMemberRequest req = buildAddRequest(deptEmployee, LocalDate.now(), LocalDate.now().plusDays(20), new BigDecimal("40"));
        teamService.addMember(team.getId(), req);
        teamService.markTeamReady(team.getId());

        // Project has 2 depts but only 1 completed → TEAM_FORMATION_IN_PROGRESS
        TechnicalProject updated = technicalProjectRepository.findById(freshTp.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(TechnicalProjectStatus.TEAM_FORMATION_IN_PROGRESS);
    }

    @Test
    void markReady_alreadyReady_throwsConflict() {
        authenticateAsHod();
        ProjectTeamDetailDTO team = teamService.createOrGetTeam(deptAssignment.getId(), "T_ready2");

        AddTeamMemberRequest req = buildAddRequest(deptEmployee, LocalDate.now(), LocalDate.now().plusDays(20), new BigDecimal("40"));
        teamService.addMember(team.getId(), req);
        teamService.markTeamReady(team.getId());

        assertThatThrownBy(() -> teamService.markTeamReady(team.getId()))
                .isInstanceOf(com.knoweb.salesmanagement.common.exception.ResourceConflictException.class)
                .hasMessageContaining("already READY");
    }

    // =========================================================================
    // Security: unauthenticated / 403
    // =========================================================================

    @Test
    void createTeam_unauthenticated_throwsAccessDenied() {
        SecurityContextHolder.clearContext();
        assertThatThrownBy(() -> teamService.createOrGetTeam(deptAssignment.getId(), "Hack"))
                .isInstanceOf(AccessDeniedException.class);
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    private User createUser(String prefix) {
        User user = new User();
        user.setEmail(prefix + "@example.com");
        user.setFirstName("Test");
        user.setLastName("User");
        user.setPasswordHash("hash");
        return userRepository.save(user);
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

    private TechnicalProject createRoutedProject() {
        return createRoutedProjectForDept(dept);
    }

    private TechnicalProject createRoutedProjectForDept(Department targetDept) {
        Client client = new Client();
        client.setName("Client-" + UUID.randomUUID().toString().substring(0, 4));
        client.setClientType(ClientType.COMPANY);
        client = clientRepository.save(client);

        Lead lead = new Lead();
        lead.setTitle("Lead-" + UUID.randomUUID().toString().substring(0, 4));
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
        pb.setProjectTitle("Test Project " + UUID.randomUUID().toString().substring(0, 4));
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

        // Initialize as TC (global)
        Authentication originalAuth = SecurityContextHolder.getContext().getAuthentication();
        authenticateAsAdmin();
        TechnicalProject tp = initService.initializeTechnicalProject(pb.getId());

        TechnicalRoutingRequest routingReq = new TechnicalRoutingRequest();
        TechnicalRoutingDepartmentRequest dReq = new TechnicalRoutingDepartmentRequest();
        dReq.setDepartmentId(targetDept.getId());
        dReq.setRequiredScope("Full scope");
        dReq.setExpectedEstimateSubmissionDate(LocalDate.now().plusDays(14));
        routingReq.setDepartments(List.of(dReq));
        routingService.routeProject(tp.getId(), routingReq);
        
        SecurityContextHolder.getContext().setAuthentication(originalAuth);

        return technicalProjectRepository.findById(tp.getId()).orElseThrow();
    }

    private TechnicalProject createRoutedProjectForDepts(Department d1, Department d2) {
        Client client = new Client();
        client.setName("Client-" + UUID.randomUUID().toString().substring(0, 4));
        client.setClientType(ClientType.COMPANY);
        client = clientRepository.save(client);

        Lead lead = new Lead();
        lead.setTitle("Lead-" + UUID.randomUUID().toString().substring(0, 4));
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
        pb.setProjectTitle("Multi-Dept " + UUID.randomUUID().toString().substring(0, 4));
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

        authenticateAsAdmin();
        TechnicalProject tp = initService.initializeTechnicalProject(pb.getId());

        TechnicalRoutingRequest routingReq = new TechnicalRoutingRequest();
        TechnicalRoutingDepartmentRequest dReq1 = new TechnicalRoutingDepartmentRequest();
        dReq1.setDepartmentId(d1.getId());
        dReq1.setRequiredScope("Scope d1");
        dReq1.setExpectedEstimateSubmissionDate(LocalDate.now().plusDays(14));
        TechnicalRoutingDepartmentRequest dReq2 = new TechnicalRoutingDepartmentRequest();
        dReq2.setDepartmentId(d2.getId());
        dReq2.setRequiredScope("Scope d2");
        dReq2.setExpectedEstimateSubmissionDate(LocalDate.now().plusDays(14));
        routingReq.setDepartments(List.of(dReq1, dReq2));
        routingService.routeProject(tp.getId(), routingReq);

        return technicalProjectRepository.findById(tp.getId()).orElseThrow();
    }

    private AddTeamMemberRequest buildAddRequest(Employee e, LocalDate start, LocalDate end, BigDecimal hours) {
        AddTeamMemberRequest req = new AddTeamMemberRequest();
        req.setEmployeeId(e.getId());
        req.setProjectRole(ProjectRole.PROJECT_ENGINEER);
        req.setAllocationStartDate(start);
        req.setAllocationEndDate(end);
        req.setAssignedHours(hours);
        req.setPrimaryMember(false);
        return req;
    }

    // Authentication helpers

    private void authenticateAsAdmin() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        adminUser.getEmail(), null,
                        List.of(new SimpleGrantedAuthority("ROLE_SYSTEM_ADMIN"),
                                new SimpleGrantedAuthority("PROJECT_TEAM_MANAGE"),
                                new SimpleGrantedAuthority("PROJECT_TEAM_READ"),
                                new SimpleGrantedAuthority("EMPLOYEE_ALLOCATION_MANAGE"),
                                new SimpleGrantedAuthority("EMPLOYEE_ALLOCATION_READ"),
                                new SimpleGrantedAuthority("TECHNICAL_PROJECT_READ"),
                                new SimpleGrantedAuthority("TECHNICAL_PROJECT_ROUTE"))));
    }

    private void authenticateAsAdminWithOverride() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        adminUser.getEmail(), null,
                        List.of(new SimpleGrantedAuthority("ROLE_SYSTEM_ADMIN"),
                                new SimpleGrantedAuthority("PROJECT_TEAM_MANAGE"),
                                new SimpleGrantedAuthority("PROJECT_TEAM_READ"),
                                new SimpleGrantedAuthority("EMPLOYEE_ALLOCATION_MANAGE"),
                                new SimpleGrantedAuthority("EMPLOYEE_ALLOCATION_READ"),
                                new SimpleGrantedAuthority("EMPLOYEE_ALLOCATION_OVERRIDE"),
                                new SimpleGrantedAuthority("TECHNICAL_PROJECT_READ"),
                                new SimpleGrantedAuthority("TECHNICAL_PROJECT_ROUTE"))));
    }

    private void authenticateAsHod() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        hodUser.getEmail(), null,
                        List.of(new SimpleGrantedAuthority("ROLE_HOD"),
                                new SimpleGrantedAuthority("PROJECT_TEAM_MANAGE"),
                                new SimpleGrantedAuthority("PROJECT_TEAM_READ"),
                                new SimpleGrantedAuthority("EMPLOYEE_ALLOCATION_MANAGE"),
                                new SimpleGrantedAuthority("EMPLOYEE_ALLOCATION_READ"),
                                // No EMPLOYEE_ALLOCATION_OVERRIDE
                                new SimpleGrantedAuthority("TECHNICAL_PROJECT_READ"))));
    }
}
