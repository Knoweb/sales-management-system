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
import com.knoweb.salesmanagement.technicalproject.entity.ProjectTeam;
import com.knoweb.salesmanagement.technicalproject.entity.ProjectTeamMember;
import com.knoweb.salesmanagement.technicalproject.entity.TechnicalProject;
import com.knoweb.salesmanagement.technicalproject.entity.TechnicalProjectDepartment;
import com.knoweb.salesmanagement.technicalproject.enums.ProjectRole;
import com.knoweb.salesmanagement.technicalproject.enums.ProjectTeamMemberStatus;
import com.knoweb.salesmanagement.technicalproject.enums.ProjectTeamStatus;
import com.knoweb.salesmanagement.technicalproject.enums.TeamFormationStatus;
import com.knoweb.salesmanagement.technicalproject.enums.TechnicalProjectStatus;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class TechnicalProjectRepositoryTest {

    @Autowired private TechnicalProjectRepository technicalProjectRepository;
    @Autowired private TechnicalProjectDepartmentRepository departmentRepository;
    @Autowired private ProjectTeamRepository projectTeamRepository;
    @Autowired private ProjectTeamMemberRepository teamMemberRepository;
    
    @Autowired private UserRepository userRepository;
    @Autowired private ClientRepository clientRepository;
    @Autowired private LeadRepository leadRepository;
    @Autowired private ProductCategoryRepository categoryRepository;
    @Autowired private SalesOpportunityRepository opportunityRepository;
    @Autowired private ProjectBriefRepository briefRepository;
    @Autowired private DepartmentRepository coreDepartmentRepository;
    @Autowired private EmployeeRepository employeeRepository;
    
    @Autowired private EntityManager entityManager;

    private User admin;
    private ProjectBrief brief;
    private Department coreDept;
    private Employee employee;

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
    }

    private TechnicalProject createValidTechnicalProject() {
        TechnicalProject tp = new TechnicalProject();
        tp.setProjectCode("TP-" + UUID.randomUUID().toString().substring(0, 8));
        tp.setProjectBrief(brief);
        tp.setStatus(TechnicalProjectStatus.AWAITING_TECHNICAL_ROUTING);
        return technicalProjectRepository.save(tp);
    }

    @Test
    public void testSaveAndLoadTechnicalProject() {
        TechnicalProject tp = createValidTechnicalProject();
        assertNotNull(tp.getId());
        assertEquals(TechnicalProjectStatus.AWAITING_TECHNICAL_ROUTING, tp.getStatus());
        assertEquals(0, tp.getVersion());
    }

    @Test
    public void testUniqueProjectCode() {
        TechnicalProject tp1 = createValidTechnicalProject();
        
        ProjectBrief brief2 = new ProjectBrief();
        brief2.setProjectTitle("Title 2");
        brief2.setBusinessProblem("Prob");
        brief2.setRequiredSolution("Sol");
        brief2.setProjectScope("Scope");
        brief2.setTechnicalRequirements("Tech");
        brief2.setExpectedBudget(BigDecimal.valueOf(1000));
        brief2.setCurrency("USD");
        brief2.setDueAt(OffsetDateTime.now().plusDays(1));
        brief2.setExpectedDeadline(LocalDate.now().plusDays(10));
        brief2.setStatus(ProjectBriefStatus.DRAFT);
        brief2 = briefRepository.save(brief2);
        
        TechnicalProject tp2 = new TechnicalProject();
        tp2.setProjectCode(tp1.getProjectCode()); // Duplicate code
        tp2.setProjectBrief(brief2);
        tp2.setStatus(TechnicalProjectStatus.AWAITING_TECHNICAL_ROUTING);
        
        assertThrows(DataIntegrityViolationException.class, () -> {
            technicalProjectRepository.saveAndFlush(tp2);
        });
    }

    @Test
    public void testUniqueProjectBrief() {
        TechnicalProject tp1 = createValidTechnicalProject();
        
        TechnicalProject tp2 = new TechnicalProject();
        tp2.setProjectCode("TP-" + UUID.randomUUID().toString().substring(0, 8));
        tp2.setProjectBrief(brief); // Duplicate brief
        tp2.setStatus(TechnicalProjectStatus.AWAITING_TECHNICAL_ROUTING);
        
        assertThrows(DataIntegrityViolationException.class, () -> {
            technicalProjectRepository.saveAndFlush(tp2);
        });
    }

    @Test
    public void testOptimisticLockingTechnicalProject() {
        TechnicalProject tp = createValidTechnicalProject();
        entityManager.flush();
        entityManager.clear();
        
        TechnicalProject tp1 = technicalProjectRepository.findById(tp.getId()).get();
        entityManager.clear();
        TechnicalProject tp2 = technicalProjectRepository.findById(tp.getId()).get();
        entityManager.clear();
        
        tp1.setStatus(TechnicalProjectStatus.ROUTED);
        technicalProjectRepository.saveAndFlush(tp1);
        
        tp2.setStatus(TechnicalProjectStatus.TEAM_FORMATION_IN_PROGRESS);
        assertThrows(ObjectOptimisticLockingFailureException.class, () -> {
            technicalProjectRepository.saveAndFlush(tp2);
        });
    }

    private TechnicalProjectDepartment createValidDepartmentAssignment(TechnicalProject tp) {
        TechnicalProjectDepartment tpd = new TechnicalProjectDepartment();
        tpd.setTechnicalProject(tp);
        tpd.setDepartment(coreDept);
        tpd.setRequiredScope("Backend Implementation");
        tpd.setExpectedEstimateSubmissionDate(LocalDate.now().plusDays(7));
        tpd.setFormationStatus(TeamFormationStatus.PENDING);
        return departmentRepository.save(tpd);
    }

    @Test
    public void testSaveDepartmentAssignment() {
        TechnicalProject tp = createValidTechnicalProject();
        TechnicalProjectDepartment tpd = createValidDepartmentAssignment(tp);
        assertNotNull(tpd.getId());
        assertEquals("Backend Implementation", tpd.getRequiredScope());
    }

    @Test
    public void testUniqueDepartmentAssignmentPerProject() {
        TechnicalProject tp = createValidTechnicalProject();
        createValidDepartmentAssignment(tp);
        
        TechnicalProjectDepartment dup = new TechnicalProjectDepartment();
        dup.setTechnicalProject(tp);
        dup.setDepartment(coreDept);
        dup.setRequiredScope("Other Scope");
        dup.setExpectedEstimateSubmissionDate(LocalDate.now().plusDays(7));
        dup.setFormationStatus(TeamFormationStatus.PENDING);
        
        assertThrows(DataIntegrityViolationException.class, () -> {
            departmentRepository.saveAndFlush(dup);
        });
    }

    private ProjectTeam createValidProjectTeam(TechnicalProjectDepartment tpd) {
        ProjectTeam team = new ProjectTeam();
        team.setTechnicalProjectDepartment(tpd);
        team.setTeamName("Alpha Team");
        team.setStatus(ProjectTeamStatus.DRAFT);
        return projectTeamRepository.save(team);
    }

    @Test
    public void testSaveProjectTeam() {
        TechnicalProject tp = createValidTechnicalProject();
        TechnicalProjectDepartment tpd = createValidDepartmentAssignment(tp);
        ProjectTeam team = createValidProjectTeam(tpd);
        assertNotNull(team.getId());
    }

    @Test
    public void testUniqueProjectTeamPerAssignment() {
        TechnicalProject tp = createValidTechnicalProject();
        TechnicalProjectDepartment tpd = createValidDepartmentAssignment(tp);
        createValidProjectTeam(tpd);
        
        ProjectTeam dup = new ProjectTeam();
        dup.setTechnicalProjectDepartment(tpd);
        dup.setStatus(ProjectTeamStatus.DRAFT);
        
        assertThrows(DataIntegrityViolationException.class, () -> {
            projectTeamRepository.saveAndFlush(dup);
        });
    }

    @Test
    public void testProjectTeamMemberPersistence() {
        TechnicalProject tp = createValidTechnicalProject();
        TechnicalProjectDepartment tpd = createValidDepartmentAssignment(tp);
        ProjectTeam team = createValidProjectTeam(tpd);
        
        ProjectTeamMember member = new ProjectTeamMember();
        member.setProjectTeam(team);
        member.setEmployee(employee);
        member.setProjectRole(ProjectRole.SOFTWARE_ENGINEER);
        member.setAllocationStartDate(LocalDate.now());
        member.setAllocationEndDate(LocalDate.now().plusDays(5));
        member.setAssignedHours(new BigDecimal("40.50"));
        member.setStatus(ProjectTeamMemberStatus.ACTIVE);
        
        member = teamMemberRepository.save(member);
        assertNotNull(member.getId());
        assertEquals(0, new BigDecimal("40.50").compareTo(member.getAssignedHours()));
    }
    
    @Test
    public void testProjectTeamMemberNegativeHoursRejected() {
        TechnicalProject tp = createValidTechnicalProject();
        TechnicalProjectDepartment tpd = createValidDepartmentAssignment(tp);
        ProjectTeam team = createValidProjectTeam(tpd);
        
        ProjectTeamMember member = new ProjectTeamMember();
        member.setProjectTeam(team);
        member.setEmployee(employee);
        member.setProjectRole(ProjectRole.SOFTWARE_ENGINEER);
        member.setAllocationStartDate(LocalDate.now());
        member.setAllocationEndDate(LocalDate.now().plusDays(5));
        member.setAssignedHours(new BigDecimal("-10.00")); // Should fail
        member.setStatus(ProjectTeamMemberStatus.ACTIVE);
        
        assertThrows(Exception.class, () -> {
            teamMemberRepository.saveAndFlush(member);
        });
    }
    
    @Test
    public void testProjectTeamMemberInvalidDatesRejected() {
        TechnicalProject tp = createValidTechnicalProject();
        TechnicalProjectDepartment tpd = createValidDepartmentAssignment(tp);
        ProjectTeam team = createValidProjectTeam(tpd);
        
        ProjectTeamMember member = new ProjectTeamMember();
        member.setProjectTeam(team);
        member.setEmployee(employee);
        member.setProjectRole(ProjectRole.SOFTWARE_ENGINEER);
        member.setAllocationStartDate(LocalDate.now().plusDays(5));
        member.setAllocationEndDate(LocalDate.now()); // End before start
        member.setAssignedHours(new BigDecimal("10.00"));
        member.setStatus(ProjectTeamMemberStatus.ACTIVE);
        
        assertThrows(DataIntegrityViolationException.class, () -> {
            teamMemberRepository.saveAndFlush(member);
        });
    }

    @Test
    public void testDuplicateActiveMembershipRejected() {
        TechnicalProject tp = createValidTechnicalProject();
        TechnicalProjectDepartment tpd = createValidDepartmentAssignment(tp);
        ProjectTeam team = createValidProjectTeam(tpd);
        
        ProjectTeamMember member1 = new ProjectTeamMember();
        member1.setProjectTeam(team);
        member1.setEmployee(employee);
        member1.setProjectRole(ProjectRole.SOFTWARE_ENGINEER);
        member1.setAllocationStartDate(LocalDate.now());
        member1.setAllocationEndDate(LocalDate.now().plusDays(5));
        member1.setAssignedHours(new BigDecimal("10.00"));
        member1.setStatus(ProjectTeamMemberStatus.ACTIVE);
        teamMemberRepository.saveAndFlush(member1);
        
        ProjectTeamMember member2 = new ProjectTeamMember();
        member2.setProjectTeam(team);
        member2.setEmployee(employee);
        member2.setProjectRole(ProjectRole.PROJECT_MANAGER);
        member2.setAllocationStartDate(LocalDate.now());
        member2.setAllocationEndDate(LocalDate.now().plusDays(5));
        member2.setAssignedHours(new BigDecimal("10.00"));
        member2.setStatus(ProjectTeamMemberStatus.ACTIVE);
        
        assertThrows(DataIntegrityViolationException.class, () -> {
            teamMemberRepository.saveAndFlush(member2);
        });
    }
    
    @Test
    public void testRemovedMembershipAllowsNewActiveMembership() {
        TechnicalProject tp = createValidTechnicalProject();
        TechnicalProjectDepartment tpd = createValidDepartmentAssignment(tp);
        ProjectTeam team = createValidProjectTeam(tpd);
        
        ProjectTeamMember member1 = new ProjectTeamMember();
        member1.setProjectTeam(team);
        member1.setEmployee(employee);
        member1.setProjectRole(ProjectRole.SOFTWARE_ENGINEER);
        member1.setAllocationStartDate(LocalDate.now());
        member1.setAllocationEndDate(LocalDate.now().plusDays(5));
        member1.setAssignedHours(new BigDecimal("10.00"));
        member1.setStatus(ProjectTeamMemberStatus.REMOVED);
        teamMemberRepository.saveAndFlush(member1);
        
        ProjectTeamMember member2 = new ProjectTeamMember();
        member2.setProjectTeam(team);
        member2.setEmployee(employee);
        member2.setProjectRole(ProjectRole.PROJECT_MANAGER);
        member2.setAllocationStartDate(LocalDate.now());
        member2.setAllocationEndDate(LocalDate.now().plusDays(5));
        member2.setAssignedHours(new BigDecimal("10.00"));
        member2.setStatus(ProjectTeamMemberStatus.ACTIVE);
        
        // This should pass because of the partial unique index
        teamMemberRepository.saveAndFlush(member2);
        assertTrue(teamMemberRepository.existsByProjectTeamIdAndEmployeeIdAndStatus(team.getId(), employee.getId(), ProjectTeamMemberStatus.ACTIVE));
    }

    @Test
    public void testTechnicalProjectInvalidProjectBriefFk() {
        TechnicalProject tp = new TechnicalProject();
        tp.setProjectCode("TP-FK-1");
        ProjectBrief nonExistentBrief = new ProjectBrief();
        nonExistentBrief.setId(UUID.randomUUID());
        tp.setProjectBrief(nonExistentBrief);
        tp.setStatus(TechnicalProjectStatus.AWAITING_TECHNICAL_ROUTING);
        
        assertThrows(DataIntegrityViolationException.class, () -> {
            technicalProjectRepository.saveAndFlush(tp);
        });
    }

    @Test
    public void testTechnicalProjectDepartmentInvalidTechnicalProjectFk() {
        TechnicalProjectDepartment tpd = new TechnicalProjectDepartment();
        TechnicalProject nonExistentTp = new TechnicalProject();
        nonExistentTp.setId(UUID.randomUUID());
        tpd.setTechnicalProject(nonExistentTp);
        tpd.setDepartment(coreDept);
        tpd.setRequiredScope("Backend Implementation");
        tpd.setExpectedEstimateSubmissionDate(LocalDate.now().plusDays(7));
        tpd.setFormationStatus(TeamFormationStatus.PENDING);
        
        assertThrows(DataIntegrityViolationException.class, () -> {
            departmentRepository.saveAndFlush(tpd);
        });
    }

    @Test
    public void testProjectTeamInvalidTechnicalProjectDepartmentFk() {
        ProjectTeam team = new ProjectTeam();
        TechnicalProjectDepartment nonExistentTpd = new TechnicalProjectDepartment();
        nonExistentTpd.setId(UUID.randomUUID());
        team.setTechnicalProjectDepartment(nonExistentTpd);
        team.setTeamName("Alpha Team");
        team.setStatus(ProjectTeamStatus.DRAFT);
        
        assertThrows(DataIntegrityViolationException.class, () -> {
            projectTeamRepository.saveAndFlush(team);
        });
    }

    @Test
    public void testProjectTeamMemberInvalidEmployeeFk() {
        TechnicalProject tp = createValidTechnicalProject();
        TechnicalProjectDepartment tpd = createValidDepartmentAssignment(tp);
        ProjectTeam team = createValidProjectTeam(tpd);
        
        ProjectTeamMember member = new ProjectTeamMember();
        member.setProjectTeam(team);
        Employee nonExistentEmployee = new Employee();
        nonExistentEmployee.setId(UUID.randomUUID());
        member.setEmployee(nonExistentEmployee);
        member.setProjectRole(ProjectRole.SOFTWARE_ENGINEER);
        member.setAllocationStartDate(LocalDate.now());
        member.setAllocationEndDate(LocalDate.now().plusDays(5));
        member.setAssignedHours(new BigDecimal("40.50"));
        member.setStatus(ProjectTeamMemberStatus.ACTIVE);
        
        assertThrows(DataIntegrityViolationException.class, () -> {
            teamMemberRepository.saveAndFlush(member);
        });
    }

    @Test
    public void testProjectTeamMemberInvalidProjectTeamFk() {
        ProjectTeamMember member = new ProjectTeamMember();
        ProjectTeam nonExistentTeam = new ProjectTeam();
        nonExistentTeam.setId(UUID.randomUUID());
        member.setProjectTeam(nonExistentTeam);
        member.setEmployee(employee);
        member.setProjectRole(ProjectRole.SOFTWARE_ENGINEER);
        member.setAllocationStartDate(LocalDate.now());
        member.setAllocationEndDate(LocalDate.now().plusDays(5));
        member.setAssignedHours(new BigDecimal("40.50"));
        member.setStatus(ProjectTeamMemberStatus.ACTIVE);
        
        assertThrows(DataIntegrityViolationException.class, () -> {
            teamMemberRepository.saveAndFlush(member);
        });
    }
}
