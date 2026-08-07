package com.knoweb.salesmanagement.employee.repository;

import com.knoweb.salesmanagement.department.entity.Department;
import com.knoweb.salesmanagement.department.repository.DepartmentRepository;
import com.knoweb.salesmanagement.employee.entity.Employee;
import com.knoweb.salesmanagement.employee.enums.EmploymentStatus;
import com.knoweb.salesmanagement.employee.enums.EmploymentType;
import com.knoweb.salesmanagement.role.entity.Role;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.role.repository.RoleRepository;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.context.ActiveProfiles;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class EmployeeRepositoryTest {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    private Department testDepartment;

    @BeforeEach
    public void setUp() {
        // Create a shared department for all test employees
        testDepartment = departmentRepository.findByCodeIgnoreCase("TEST_DEPT").orElseGet(() -> {
            Department d = new Department();
            d.setCode("TEST_DEPT");
            d.setName("Test Department");
            return departmentRepository.save(d);
        });
    }

    private Employee buildEmployee(String number, String firstName, String lastName,
                                   String email, EmploymentStatus status, User user) {
        Employee e = new Employee();
        e.setEmployeeNumber(number);
        e.setFirstName(firstName);
        e.setLastName(lastName);
        e.setWorkEmail(email);
        e.setJobTitle("Project Manager");
        e.setEmploymentStatus(status);
        e.setEmploymentType(EmploymentType.FULL_TIME);
        e.setDepartment(testDepartment);
        e.setUser(user);
        return e;
    }

    @Test
    public void testFindEligibleProjectManagers() {
        Role pmRole = roleRepository.findByCode("PROJECT_MANAGER").orElseGet(() -> {
            Role r = new Role();
            r.setCode("PROJECT_MANAGER");
            r.setName("Project Manager");
            return roleRepository.save(r);
        });

        Role otherRole = roleRepository.findByCode("EMPLOYEE").orElseGet(() -> {
            Role r = new Role();
            r.setCode("EMPLOYEE");
            r.setName("Employee");
            return roleRepository.save(r);
        });

        // 1. Active Employee + Active User + PM Role -> Should appear
        User u1 = new User();
        u1.setEmail("a@b.com");
        u1.setPasswordHash("pass");
        u1.setFirstName("A");
        u1.setLastName("B");
        u1.setActive(true);
        u1.setRoles(Set.of(pmRole));
        userRepository.save(u1);
        employeeRepository.save(buildEmployee("EMP1", "A", "B", "a@b.com", EmploymentStatus.ACTIVE, u1));

        // 2. Project Manager job title without PROJECT_MANAGER role -> Should not appear
        User u2 = new User();
        u2.setEmail("c@d.com");
        u2.setPasswordHash("pass");
        u2.setFirstName("C");
        u2.setLastName("D");
        u2.setActive(true);
        u2.setRoles(Set.of(otherRole));
        userRepository.save(u2);
        employeeRepository.save(buildEmployee("EMP2", "C", "D", "c@d.com", EmploymentStatus.ACTIVE, u2));

        // 3. Inactive User -> Should not appear
        User u3 = new User();
        u3.setEmail("e@f.com");
        u3.setPasswordHash("pass");
        u3.setFirstName("E");
        u3.setLastName("F");
        u3.setActive(false);
        u3.setRoles(Set.of(pmRole));
        userRepository.save(u3);
        employeeRepository.save(buildEmployee("EMP3", "E", "F", "e@f.com", EmploymentStatus.ACTIVE, u3));

        // 4. Inactive Employee -> Should not appear
        User u4 = new User();
        u4.setEmail("g@h.com");
        u4.setPasswordHash("pass");
        u4.setFirstName("G");
        u4.setLastName("H");
        u4.setActive(true);
        u4.setRoles(Set.of(pmRole));
        userRepository.save(u4);
        employeeRepository.save(buildEmployee("EMP4", "G", "H", "g@h.com", EmploymentStatus.TERMINATED, u4));

        // Execute query
        List<Employee> eligiblePms = employeeRepository.findEligibleProjectManagers();

        // Verify
        assertThat(eligiblePms).hasSize(1);
        assertThat(eligiblePms.get(0).getEmployeeNumber()).isEqualTo("EMP1");
    }
}
