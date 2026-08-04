package com.knoweb.salesmanagement.technicalproject.repository;

import com.knoweb.salesmanagement.client.entity.Client;
import com.knoweb.salesmanagement.client.enums.ClientType;
import com.knoweb.salesmanagement.client.repository.ClientRepository;
import com.knoweb.salesmanagement.department.entity.Department;
import com.knoweb.salesmanagement.department.repository.DepartmentRepository;
import com.knoweb.salesmanagement.employee.entity.Employee;
import com.knoweb.salesmanagement.employee.repository.EmployeeRepository;
import com.knoweb.salesmanagement.lead.entity.Lead;
import com.knoweb.salesmanagement.lead.enums.InquirySource;
import com.knoweb.salesmanagement.lead.enums.LeadStatus;
import com.knoweb.salesmanagement.lead.repository.LeadRepository;
import com.knoweb.salesmanagement.opportunity.entity.SalesOpportunity;
import com.knoweb.salesmanagement.opportunity.repository.SalesOpportunityRepository;
import com.knoweb.salesmanagement.productcategory.entity.ProductCategory;
import com.knoweb.salesmanagement.productcategory.repository.ProductCategoryRepository;
import com.knoweb.salesmanagement.projectbrief.entity.ProjectBrief;
import com.knoweb.salesmanagement.projectbrief.enums.ProjectBriefStatus;
import com.knoweb.salesmanagement.projectbrief.repository.ProjectBriefRepository;
import com.knoweb.salesmanagement.technicalproject.entity.EmployeeAllocation;
import com.knoweb.salesmanagement.technicalproject.entity.ProjectTeam;
import com.knoweb.salesmanagement.technicalproject.entity.TechnicalProject;
import com.knoweb.salesmanagement.technicalproject.entity.TechnicalProjectDepartment;
import com.knoweb.salesmanagement.technicalproject.enums.EmployeeAllocationStatus;
import com.knoweb.salesmanagement.technicalproject.enums.ProjectTeamStatus;
import com.knoweb.salesmanagement.technicalproject.enums.TeamFormationStatus;
import com.knoweb.salesmanagement.technicalproject.enums.TechnicalProjectStatus;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
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
public class EmployeeAllocationRepositoryTest {

    @Autowired private EmployeeAllocationRepository allocationRepository;
    @Autowired private TechnicalProjectRepository projectRepository;
    @Autowired private TechnicalProjectDepartmentRepository departmentRepository;
    @Autowired private ProjectTeamRepository teamRepository;
    
    @Autowired private UserRepository userRepository;
    @Autowired private ClientRepository clientRepository;
    @Autowired private LeadRepository leadRepository;
    @Autowired private ProductCategoryRepository categoryRepository;
    @Autowired private SalesOpportunityRepository opportunityRepository;
    @Autowired private ProjectBriefRepository briefRepository;
    @Autowired private DepartmentRepository coreDepartmentRepository;
    @Autowired private EmployeeRepository employeeRepository;

    private User admin;
    private Employee employee;
    private TechnicalProject tp;
    private ProjectTeam team;
    private Department coreDept;

    @BeforeEach
    public void setup() {
        admin = new User();
        admin.setEmail("admin_" + UUID.randomUUID() + "@test.com");
        admin.setFirstName("Admin");
        admin.setLastName("Test");
        admin.setPasswordHash("pass");
        admin = userRepository.save(admin);

        Client client = new Client();
        client.setName("Test Client Co");
        client.setClientType(ClientType.COMPANY);
        client = clientRepository.save(client);

        Lead lead = new Lead();
        lead.setTitle("Test Lead");
        lead.setClient(client);
        lead.setInquirySource(InquirySource.WEBSITE);
        lead.setStatus(LeadStatus.NEW);
        lead = leadRepository.save(lead);

        ProductCategory category = new ProductCategory();
        category.setCode("CAT-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        category.setName("Category");
        category = categoryRepository.save(category);

        SalesOpportunity opportunity = new SalesOpportunity();
        opportunity.setOpportunityNumber("OPP-" + UUID.randomUUID().toString().substring(0, 8));
        opportunity.setTitle("Test Opp");
        opportunity.setClient(client);
        opportunity.setLead(lead);
        opportunity.setProductCategory(category);
        opportunity.setStage(com.knoweb.salesmanagement.opportunity.enums.OpportunityStage.QUALIFIED);
        opportunity.setEstimatedValue(BigDecimal.valueOf(10000));
        opportunity.setExpectedCloseDate(LocalDate.now().plusDays(30));
        opportunity = opportunityRepository.save(opportunity);

        ProjectBrief brief = new ProjectBrief();
        brief.setOpportunity(opportunity);
        brief.setStatus(ProjectBriefStatus.DRAFT);
        brief.setProjectTitle("Test Title");
        brief.setBusinessProblem("Problem");
        brief.setRequiredSolution("Solution");
        brief.setProjectScope("Scope");
        brief.setTechnicalRequirements("Tech");
        brief.setExpectedBudget(BigDecimal.valueOf(1000));
        brief.setCurrency("USD");
        brief.setDueAt(OffsetDateTime.now().plusDays(1));
        brief.setExpectedDeadline(LocalDate.now().plusDays(10));
        brief = briefRepository.save(brief);

        coreDept = new Department();
        coreDept.setCode("DEP-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        coreDept.setName("Test Dept");
        coreDept = coreDepartmentRepository.save(coreDept);

        employee = new Employee();
        employee.setEmployeeNumber("EMP-" + UUID.randomUUID().toString().substring(0, 4));
        employee.setFirstName("John");
        employee.setLastName("Doe");
        employee.setWorkEmail("john.doe" + UUID.randomUUID().toString().substring(0, 4) + "@test.com");
        employee.setDepartment(coreDept);
        employee.setJobTitle("Engineer");
        employee.setEmploymentType(com.knoweb.salesmanagement.employee.enums.EmploymentType.FULL_TIME);
        employee.setEmploymentStatus(com.knoweb.salesmanagement.employee.enums.EmploymentStatus.ACTIVE);
        employee.setHireDate(LocalDate.now());
        employee = employeeRepository.save(employee);

        tp = new TechnicalProject();
        tp.setProjectCode("TP-" + UUID.randomUUID().toString().substring(0, 8));
        tp.setProjectBrief(brief);
        tp.setStatus(TechnicalProjectStatus.AWAITING_TECHNICAL_ROUTING);
        tp = projectRepository.save(tp);

        TechnicalProjectDepartment tpd = new TechnicalProjectDepartment();
        tpd.setTechnicalProject(tp);
        tpd.setDepartment(coreDept);
        tpd.setRequiredScope("Backend Implementation");
        tpd.setExpectedEstimateSubmissionDate(LocalDate.now().plusDays(7));
        tpd.setFormationStatus(TeamFormationStatus.PENDING);
        tpd = departmentRepository.save(tpd);

        team = new ProjectTeam();
        team.setTechnicalProjectDepartment(tpd);
        team.setTeamName("Alpha Team");
        team.setStatus(ProjectTeamStatus.DRAFT);
        team = teamRepository.save(team);
    }

    private EmployeeAllocation createAllocation(LocalDate start, LocalDate end, BigDecimal hours) {
        EmployeeAllocation alloc = new EmployeeAllocation();
        alloc.setEmployee(employee);
        alloc.setTechnicalProject(tp);
        alloc.setProjectTeam(team);
        alloc.setDepartment(coreDept);
        alloc.setAllocationStartDate(start);
        alloc.setAllocationEndDate(end);
        alloc.setAssignedHours(hours);
        alloc.setStatus(EmployeeAllocationStatus.ACTIVE);
        return allocationRepository.saveAndFlush(alloc);
    }

    @Test
    public void testSaveEmployeeAllocation() {
        EmployeeAllocation alloc = createAllocation(LocalDate.now(), LocalDate.now().plusDays(5), new BigDecimal("20.00"));
        assertNotNull(alloc.getId());
        assertEquals(0, new BigDecimal("20.00").compareTo(alloc.getAssignedHours()));
        assertFalse(alloc.isOverrideFlag()); // default is false
    }

    @Test
    public void testNegativeHoursRejected() {
        EmployeeAllocation alloc = new EmployeeAllocation();
        alloc.setEmployee(employee);
        alloc.setTechnicalProject(tp);
        alloc.setProjectTeam(team);
        alloc.setDepartment(coreDept);
        alloc.setAllocationStartDate(LocalDate.now());
        alloc.setAllocationEndDate(LocalDate.now().plusDays(5));
        alloc.setAssignedHours(new BigDecimal("-5.00")); // fails
        alloc.setStatus(EmployeeAllocationStatus.ACTIVE);
        
        assertThrows(Exception.class, () -> {
            allocationRepository.saveAndFlush(alloc);
        });
    }

    @Test
    public void testZeroHoursRejected() {
        EmployeeAllocation alloc = new EmployeeAllocation();
        alloc.setEmployee(employee);
        alloc.setTechnicalProject(tp);
        alloc.setProjectTeam(team);
        alloc.setDepartment(coreDept);
        alloc.setAllocationStartDate(LocalDate.now());
        alloc.setAllocationEndDate(LocalDate.now().plusDays(5));
        alloc.setAssignedHours(BigDecimal.ZERO); // fails
        alloc.setStatus(EmployeeAllocationStatus.ACTIVE);
        
        assertThrows(Exception.class, () -> {
            allocationRepository.saveAndFlush(alloc);
        });
    }

    @Test
    public void testInvalidDateRangeRejected() {
        EmployeeAllocation alloc = new EmployeeAllocation();
        alloc.setEmployee(employee);
        alloc.setTechnicalProject(tp);
        alloc.setProjectTeam(team);
        alloc.setDepartment(coreDept);
        alloc.setAllocationStartDate(LocalDate.now().plusDays(5));
        alloc.setAllocationEndDate(LocalDate.now()); // fails
        alloc.setAssignedHours(new BigDecimal("10.00"));
        alloc.setStatus(EmployeeAllocationStatus.ACTIVE);
        
        assertThrows(DataIntegrityViolationException.class, () -> {
            allocationRepository.saveAndFlush(alloc);
        });
    }

    @Test
    public void testOverrideFlagConstraintsEnforced() {
        EmployeeAllocation alloc = new EmployeeAllocation();
        alloc.setEmployee(employee);
        alloc.setTechnicalProject(tp);
        alloc.setProjectTeam(team);
        alloc.setDepartment(coreDept);
        alloc.setAllocationStartDate(LocalDate.now());
        alloc.setAllocationEndDate(LocalDate.now().plusDays(5));
        alloc.setAssignedHours(new BigDecimal("10.00"));
        alloc.setStatus(EmployeeAllocationStatus.ACTIVE);
        
        alloc.setOverrideFlag(true);
        // Reason, user, and timestamp are null - this should fail DB check
        
        assertThrows(DataIntegrityViolationException.class, () -> {
            allocationRepository.saveAndFlush(alloc);
        });
    }

    @Test
    public void testOverrideFlagSucceedsWhenFullyPopulated() {
        EmployeeAllocation alloc = new EmployeeAllocation();
        alloc.setEmployee(employee);
        alloc.setTechnicalProject(tp);
        alloc.setProjectTeam(team);
        alloc.setDepartment(coreDept);
        alloc.setAllocationStartDate(LocalDate.now());
        alloc.setAllocationEndDate(LocalDate.now().plusDays(5));
        alloc.setAssignedHours(new BigDecimal("10.00"));
        alloc.setStatus(EmployeeAllocationStatus.ACTIVE);
        
        alloc.setOverrideFlag(true);
        alloc.setOverrideReason("Critical deadline");
        alloc.setOverriddenBy(admin);
        alloc.setOverriddenAt(OffsetDateTime.now());
        
        assertDoesNotThrow(() -> {
            allocationRepository.saveAndFlush(alloc);
        });
    }

    @Test
    public void testDuplicateActiveAllocationRejected() {
        LocalDate start = LocalDate.now();
        LocalDate end = LocalDate.now().plusDays(5);
        
        createAllocation(start, end, new BigDecimal("10.00"));
        
        EmployeeAllocation dup = new EmployeeAllocation();
        dup.setEmployee(employee);
        dup.setTechnicalProject(tp);
        dup.setProjectTeam(team);
        dup.setDepartment(coreDept);
        dup.setAllocationStartDate(start); // exact same dates
        dup.setAllocationEndDate(end);
        dup.setAssignedHours(new BigDecimal("5.00"));
        dup.setStatus(EmployeeAllocationStatus.ACTIVE);
        
        assertThrows(DataIntegrityViolationException.class, () -> {
            allocationRepository.saveAndFlush(dup);
        });
    }

    @Test
    public void testCancelledAllocationAllowsNewActiveAllocation() {
        LocalDate start = LocalDate.now();
        LocalDate end = LocalDate.now().plusDays(5);
        
        EmployeeAllocation alloc1 = new EmployeeAllocation();
        alloc1.setEmployee(employee);
        alloc1.setTechnicalProject(tp);
        alloc1.setProjectTeam(team);
        alloc1.setDepartment(coreDept);
        alloc1.setAllocationStartDate(start);
        alloc1.setAllocationEndDate(end);
        alloc1.setAssignedHours(new BigDecimal("10.00"));
        alloc1.setStatus(EmployeeAllocationStatus.CANCELLED);
        allocationRepository.saveAndFlush(alloc1);
        
        EmployeeAllocation alloc2 = new EmployeeAllocation();
        alloc2.setEmployee(employee);
        alloc2.setTechnicalProject(tp);
        alloc2.setProjectTeam(team);
        alloc2.setDepartment(coreDept);
        alloc2.setAllocationStartDate(start);
        alloc2.setAllocationEndDate(end);
        alloc2.setAssignedHours(new BigDecimal("5.00"));
        alloc2.setStatus(EmployeeAllocationStatus.ACTIVE);
        
        // This should pass because the first one is CANCELLED and we use a partial unique index
        assertDoesNotThrow(() -> {
            allocationRepository.saveAndFlush(alloc2);
        });
    }

    @Test
    public void testDateOverlapLogic() {
        LocalDate jan1 = LocalDate.of(2026, 1, 1);
        LocalDate jan10 = LocalDate.of(2026, 1, 10);
        
        // Existing allocation from Jan 1 to Jan 10
        createAllocation(jan1, jan10, new BigDecimal("10.00"));
        
        // SCENARIO 1: Existing allocation is fully inside requested range (Requested Dec 25 - Jan 15)
        List<EmployeeAllocation> res1 = allocationRepository.findActiveOverlappingAllocations(
                employee.getId(), LocalDate.of(2025, 12, 25), LocalDate.of(2026, 1, 15), EmployeeAllocationStatus.ACTIVE);
        assertEquals(1, res1.size());
        
        // SCENARIO 2: Requested range is fully inside existing (Requested Jan 4 - Jan 6)
        List<EmployeeAllocation> res2 = allocationRepository.findActiveOverlappingAllocations(
                employee.getId(), LocalDate.of(2026, 1, 4), LocalDate.of(2026, 1, 6), EmployeeAllocationStatus.ACTIVE);
        assertEquals(1, res2.size());
        
        // SCENARIO 3: Existing overlaps start of requested (Requested Jan 5 - Jan 15)
        List<EmployeeAllocation> res3 = allocationRepository.findActiveOverlappingAllocations(
                employee.getId(), LocalDate.of(2026, 1, 5), LocalDate.of(2026, 1, 15), EmployeeAllocationStatus.ACTIVE);
        assertEquals(1, res3.size());
        
        // SCENARIO 4: Existing overlaps end of requested (Requested Dec 25 - Jan 5)
        List<EmployeeAllocation> res4 = allocationRepository.findActiveOverlappingAllocations(
                employee.getId(), LocalDate.of(2025, 12, 25), LocalDate.of(2026, 1, 5), EmployeeAllocationStatus.ACTIVE);
        assertEquals(1, res4.size());
        
        // SCENARIO 5: Existing starts exactly on requestedEndDate (Requested Dec 25 - Jan 1)
        List<EmployeeAllocation> res5 = allocationRepository.findActiveOverlappingAllocations(
                employee.getId(), LocalDate.of(2025, 12, 25), LocalDate.of(2026, 1, 1), EmployeeAllocationStatus.ACTIVE);
        assertEquals(1, res5.size());
        
        // SCENARIO 6: Existing ends exactly on requestedStartDate (Requested Jan 10 - Jan 20)
        List<EmployeeAllocation> res6 = allocationRepository.findActiveOverlappingAllocations(
                employee.getId(), LocalDate.of(2026, 1, 10), LocalDate.of(2026, 1, 20), EmployeeAllocationStatus.ACTIVE);
        assertEquals(1, res6.size());
        
        // SCENARIO 7: Existing ends before requestedStartDate (Requested Jan 11 - Jan 20) -> NO OVERLAP
        List<EmployeeAllocation> res7 = allocationRepository.findActiveOverlappingAllocations(
                employee.getId(), LocalDate.of(2026, 1, 11), LocalDate.of(2026, 1, 20), EmployeeAllocationStatus.ACTIVE);
        assertEquals(0, res7.size());
        
        // SCENARIO 8: Existing starts after requestedEndDate (Requested Dec 25 - Dec 31) -> NO OVERLAP
        List<EmployeeAllocation> res8 = allocationRepository.findActiveOverlappingAllocations(
                employee.getId(), LocalDate.of(2025, 12, 25), LocalDate.of(2025, 12, 31), EmployeeAllocationStatus.ACTIVE);
        assertEquals(0, res8.size());
        
        // SCENARIO 9: Cancelled allocations excluded from overlap queries
        EmployeeAllocation cancelledAlloc = new EmployeeAllocation();
        cancelledAlloc.setEmployee(employee);
        cancelledAlloc.setTechnicalProject(tp);
        cancelledAlloc.setProjectTeam(team);
        cancelledAlloc.setDepartment(coreDept);
        cancelledAlloc.setAllocationStartDate(LocalDate.of(2026, 2, 1));
        cancelledAlloc.setAllocationEndDate(LocalDate.of(2026, 2, 10));
        cancelledAlloc.setAssignedHours(new BigDecimal("10.00"));
        cancelledAlloc.setStatus(EmployeeAllocationStatus.CANCELLED);
        allocationRepository.saveAndFlush(cancelledAlloc);
        
        List<EmployeeAllocation> res9 = allocationRepository.findActiveOverlappingAllocations(
                employee.getId(), LocalDate.of(2026, 2, 1), LocalDate.of(2026, 2, 10), EmployeeAllocationStatus.ACTIVE);
        assertEquals(0, res9.size());
    }

    @Test
    public void testAggregationQueries() {
        LocalDate start = LocalDate.now();
        LocalDate end = LocalDate.now().plusDays(5);
        
        createAllocation(start, end, new BigDecimal("10.50"));
        
        Department newDept = new Department();
        newDept.setCode("DEP-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        newDept.setName("Test Dept 2");
        newDept = coreDepartmentRepository.save(newDept);

        TechnicalProjectDepartment tpd2 = new TechnicalProjectDepartment();
        tpd2.setTechnicalProject(tp);
        tpd2.setDepartment(newDept);
        tpd2.setRequiredScope("Scope 2");
        tpd2.setExpectedEstimateSubmissionDate(LocalDate.now().plusDays(7));
        tpd2.setFormationStatus(TeamFormationStatus.PENDING);
        tpd2 = departmentRepository.save(tpd2);

        ProjectTeam team2 = new ProjectTeam();
        team2.setTechnicalProjectDepartment(tpd2);
        team2.setTeamName("Beta Team");
        team2.setStatus(ProjectTeamStatus.DRAFT);
        team2 = teamRepository.save(team2);
        
        EmployeeAllocation alloc2 = new EmployeeAllocation();
        alloc2.setEmployee(employee);
        alloc2.setTechnicalProject(tp);
        alloc2.setProjectTeam(team2);
        alloc2.setDepartment(coreDept);
        alloc2.setAllocationStartDate(start);
        alloc2.setAllocationEndDate(end);
        alloc2.setAssignedHours(new BigDecimal("5.50"));
        alloc2.setStatus(EmployeeAllocationStatus.ACTIVE);
        allocationRepository.saveAndFlush(alloc2);
        
        BigDecimal sum = allocationRepository.sumActiveOverlappingHours(
                employee.getId(), start, end, EmployeeAllocationStatus.ACTIVE);
        
        assertEquals(0, new BigDecimal("16.00").compareTo(sum));
        
        long distinctProjects = allocationRepository.countDistinctActiveProjectsForEmployeeOverlapping(
                employee.getId(), start, end, EmployeeAllocationStatus.ACTIVE);
        assertEquals(1, distinctProjects); // Both allocations belong to the same project (tp)
        
        // SCENARIO: No allocations returning BigDecimal.ZERO
        BigDecimal emptySum = allocationRepository.sumActiveOverlappingHours(
                employee.getId(), LocalDate.of(2027, 1, 1), LocalDate.of(2027, 1, 10), EmployeeAllocationStatus.ACTIVE);
        assertEquals(0, BigDecimal.ZERO.compareTo(emptySum));
    }

    @Test
    public void testEmployeeAllocationInvalidEmployeeFk() {
        EmployeeAllocation alloc = new EmployeeAllocation();
        Employee nonExistentEmployee = new Employee();
        nonExistentEmployee.setId(UUID.randomUUID());
        alloc.setEmployee(nonExistentEmployee);
        alloc.setTechnicalProject(tp);
        alloc.setProjectTeam(team);
        alloc.setDepartment(coreDept);
        alloc.setAllocationStartDate(LocalDate.now());
        alloc.setAllocationEndDate(LocalDate.now().plusDays(5));
        alloc.setAssignedHours(new BigDecimal("20.00"));
        alloc.setStatus(EmployeeAllocationStatus.ACTIVE);
        
        assertThrows(DataIntegrityViolationException.class, () -> {
            allocationRepository.saveAndFlush(alloc);
        });
    }

    @Test
    public void testEmployeeAllocationInvalidTechnicalProjectFk() {
        EmployeeAllocation alloc = new EmployeeAllocation();
        alloc.setEmployee(employee);
        TechnicalProject nonExistentTp = new TechnicalProject();
        nonExistentTp.setId(UUID.randomUUID());
        alloc.setTechnicalProject(nonExistentTp);
        alloc.setProjectTeam(team);
        alloc.setDepartment(coreDept);
        alloc.setAllocationStartDate(LocalDate.now());
        alloc.setAllocationEndDate(LocalDate.now().plusDays(5));
        alloc.setAssignedHours(new BigDecimal("20.00"));
        alloc.setStatus(EmployeeAllocationStatus.ACTIVE);
        
        assertThrows(DataIntegrityViolationException.class, () -> {
            allocationRepository.saveAndFlush(alloc);
        });
    }

    @Test
    public void testEmployeeAllocationInvalidProjectTeamFk() {
        EmployeeAllocation alloc = new EmployeeAllocation();
        alloc.setEmployee(employee);
        alloc.setTechnicalProject(tp);
        ProjectTeam nonExistentTeam = new ProjectTeam();
        nonExistentTeam.setId(UUID.randomUUID());
        alloc.setProjectTeam(nonExistentTeam);
        alloc.setDepartment(coreDept);
        alloc.setAllocationStartDate(LocalDate.now());
        alloc.setAllocationEndDate(LocalDate.now().plusDays(5));
        alloc.setAssignedHours(new BigDecimal("20.00"));
        alloc.setStatus(EmployeeAllocationStatus.ACTIVE);
        
        assertThrows(DataIntegrityViolationException.class, () -> {
            allocationRepository.saveAndFlush(alloc);
        });
    }

    @Test
    public void testEmployeeAllocationInvalidDepartmentFk() {
        EmployeeAllocation alloc = new EmployeeAllocation();
        alloc.setEmployee(employee);
        alloc.setTechnicalProject(tp);
        alloc.setProjectTeam(team);
        Department nonExistentDept = new Department();
        nonExistentDept.setId(UUID.randomUUID());
        alloc.setDepartment(nonExistentDept);
        alloc.setAllocationStartDate(LocalDate.now());
        alloc.setAllocationEndDate(LocalDate.now().plusDays(5));
        alloc.setAssignedHours(new BigDecimal("20.00"));
        alloc.setStatus(EmployeeAllocationStatus.ACTIVE);
        
        assertThrows(DataIntegrityViolationException.class, () -> {
            allocationRepository.saveAndFlush(alloc);
        });
    }
}
