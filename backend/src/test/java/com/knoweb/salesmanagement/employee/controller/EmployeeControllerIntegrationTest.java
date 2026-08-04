package com.knoweb.salesmanagement.employee.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.knoweb.salesmanagement.department.entity.Department;
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
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.is;

@SpringBootTest
@ActiveProfiles("test")
public class EmployeeControllerIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;
    
    @Autowired
    private DepartmentRepository departmentRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
        
        
        userRepository.findByEmail("no_emp@test.com").ifPresent(userRepository::delete);
        userRepository.findByEmail("unlinked@test.com").ifPresent(u -> {
            employeeRepository.findByUserId(u.getId()).ifPresent(employeeRepository::delete);
            userRepository.delete(u);
        });
        employeeRepository.findByWorkEmailIgnoreCase("new_emp@test.com").ifPresent(employeeRepository::delete);
        userRepository.findByEmail("has_emp@test.com").ifPresent(u -> {
            employeeRepository.findByUserId(u.getId()).ifPresent(employeeRepository::delete);
            userRepository.delete(u);
        });

        User testUserWithoutEmployee = new User();
        testUserWithoutEmployee.setEmail("no_emp@test.com");
        testUserWithoutEmployee.setFirstName("No");
        testUserWithoutEmployee.setLastName("Emp");
        testUserWithoutEmployee.setPasswordHash("hash");
        userRepository.save(testUserWithoutEmployee);
        
        User testUserWithEmployee = new User();
        testUserWithEmployee.setEmail("has_emp@test.com");
        testUserWithEmployee.setFirstName("Has");
        testUserWithEmployee.setLastName("Emp");
        testUserWithEmployee.setPasswordHash("hash");
        testUserWithEmployee = userRepository.save(testUserWithEmployee);
        
        Department dept = new Department();
        dept.setCode("DPT_" + UUID.randomUUID().toString().substring(0, 5).toUpperCase());
        dept.setName("Dept " + UUID.randomUUID().toString().substring(0, 5));
        dept = departmentRepository.save(dept);
        
        Employee emp = new Employee();
        emp.setEmployeeNumber("EMP-" + UUID.randomUUID().toString().substring(0, 5));
        emp.setFirstName("Has");
        emp.setLastName("Emp");
        emp.setWorkEmail("has_emp@test.com");
        emp.setUser(testUserWithEmployee);
        emp.setDepartment(dept);
        emp.setEmploymentType(EmploymentType.FULL_TIME);
        emp.setEmploymentStatus(EmploymentStatus.ACTIVE);
        emp.setJobTitle("Tester");
        emp.setHireDate(LocalDate.now());
        emp.setWeeklyCapacityHours(BigDecimal.valueOf(40));
        employeeRepository.save(emp);
    }

    @Test
    @WithMockUser(username = "has_emp@test.com", authorities = {"EMPLOYEE_READ"})
    void getMyProfile_WhenLinkedEmployee_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/employees/me")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.linked", is(true)))
                .andExpect(jsonPath("$.employee.workEmail", is("has_emp@test.com")));
    }

    @Test
    @WithMockUser(username = "no_emp@test.com", authorities = {"EMPLOYEE_READ"})
    void getMyProfile_WhenNoEmployee_ShouldReturn200WithLinkedFalse() throws Exception {
        mockMvc.perform(get("/api/v1/employees/me")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.linked", is(false)))
                .andExpect(jsonPath("$.employee").value(org.hamcrest.Matchers.nullValue()));
    }

    @Test
    void getMyProfile_WhenUnauthenticated_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/employees/me")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "admin@test.com", authorities = {"EMPLOYEE_CREATE", "EMPLOYEE_READ"})
    void createEmployee_WithLinkedUser_ShouldPersist() throws Exception {
        User unlinkedUser = new User();
        unlinkedUser.setEmail("unlinked@test.com");
        unlinkedUser.setFirstName("Unlinked");
        unlinkedUser.setLastName("User");
        unlinkedUser.setPasswordHash("hash");
        unlinkedUser = userRepository.save(unlinkedUser);

        Department dept = departmentRepository.findAll().get(0);

        com.knoweb.salesmanagement.employee.dto.CreateEmployeeRequest request = new com.knoweb.salesmanagement.employee.dto.CreateEmployeeRequest();
        request.setEmployeeNumber("EMP-NEW-" + UUID.randomUUID().toString().substring(0, 5));
        request.setFirstName("New");
        request.setLastName("Employee");
        request.setWorkEmail("new_emp@test.com");
        request.setDepartmentId(dept.getId());
        request.setEmploymentType(EmploymentType.FULL_TIME);
        request.setWeeklyCapacityHours(BigDecimal.valueOf(40));
        request.setJobTitle("Developer");
        request.setUserId(unlinkedUser.getId());

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/employees")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.id", is(unlinkedUser.getId().toString())));
    }
}


