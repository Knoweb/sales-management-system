package com.knoweb.salesmanagement.technicalproject.controller;

import com.knoweb.salesmanagement.department.entity.Department;
import com.knoweb.salesmanagement.department.entity.DepartmentHead;
import com.knoweb.salesmanagement.department.repository.DepartmentHeadRepository;
import com.knoweb.salesmanagement.department.repository.DepartmentRepository;
import com.knoweb.salesmanagement.employee.entity.Employee;
import com.knoweb.salesmanagement.employee.enums.EmploymentStatus;
import com.knoweb.salesmanagement.employee.enums.EmploymentType;
import com.knoweb.salesmanagement.employee.repository.EmployeeRepository;
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
import java.time.OffsetDateTime;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class DepartmentProjectControllerIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private DepartmentHeadRepository departmentHeadRepository;

    private Department department;
    private Department otherDepartment;
    private User hodUser;
    private User nonHodUser;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();

        // 1. Create departments
        department = new Department();
        department.setName("HOD Department");
        department.setCode("HODDEPT");
        department.setActive(true);
        department = departmentRepository.save(department);

        otherDepartment = new Department();
        otherDepartment.setName("Other Department");
        otherDepartment.setCode("OTHDEPT");
        otherDepartment.setActive(true);
        otherDepartment = departmentRepository.save(otherDepartment);

        // 2. Create HOD User
        hodUser = new User();
        hodUser.setEmail("hod_user@test.com");
        hodUser.setFirstName("HOD");
        hodUser.setLastName("User");
        hodUser.setPasswordHash("hash");
        hodUser = userRepository.save(hodUser);

        // 3. Create HOD Employee
        Employee hodEmployee = new Employee();
        hodEmployee.setUser(hodUser);
        hodEmployee.setEmployeeNumber("EMP-HOD");
        hodEmployee.setFirstName("HOD");
        hodEmployee.setLastName("User");
        hodEmployee.setWorkEmail("hod_user@test.com");
        hodEmployee.setJobTitle("HOD");
        hodEmployee.setEmploymentStatus(EmploymentStatus.ACTIVE);
        hodEmployee.setEmploymentType(EmploymentType.FULL_TIME);
        hodEmployee.setDepartment(department);
        hodEmployee.setWeeklyCapacityHours(BigDecimal.valueOf(40.0));
        hodEmployee = employeeRepository.save(hodEmployee);

        // 4. Assign HOD as Department Head
        DepartmentHead dh = new DepartmentHead();
        dh.setDepartment(department);
        dh.setEmployee(hodEmployee);
        dh.setAssignedAt(OffsetDateTime.now());
        dh.setActive(true);
        departmentHeadRepository.save(dh);

        // 5. Create Non-HOD User
        nonHodUser = new User();
        nonHodUser.setEmail("non_hod_user@test.com");
        nonHodUser.setFirstName("Non");
        nonHodUser.setLastName("HOD");
        nonHodUser.setPasswordHash("hash");
        nonHodUser = userRepository.save(nonHodUser);
    }

    @Test
    @WithMockUser(username = "hod_user@test.com", authorities = {"PROJECT_TEAM_READ"})
    void testHodCanAccessOwnDeptProjects() throws Exception {
        mockMvc.perform(get("/api/v1/departments/{deptId}/assigned-projects", department.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "non_hod_user@test.com", authorities = {"PROJECT_TEAM_READ"})
    void testNonHodCannotAccessDeptProjects() throws Exception {
        mockMvc.perform(get("/api/v1/departments/{deptId}/assigned-projects", department.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "hod_user@test.com", authorities = {"PROJECT_TEAM_READ"})
    void testHodCannotAccessOtherDeptProjects() throws Exception {
        mockMvc.perform(get("/api/v1/departments/{deptId}/assigned-projects", otherDepartment.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }
}
