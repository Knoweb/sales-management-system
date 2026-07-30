package com.knoweb.salesmanagement.employee.repository;

import com.knoweb.salesmanagement.employee.entity.Employee;
import com.knoweb.salesmanagement.employee.enums.EmploymentStatus;
import com.knoweb.salesmanagement.employee.enums.EmploymentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, UUID>, JpaSpecificationExecutor<Employee> {
    Optional<Employee> findByEmployeeNumber(String employeeNumber);
    Optional<Employee> findByWorkEmailIgnoreCase(String workEmail);
    Optional<Employee> findByUserId(UUID userId);

    boolean existsByEmployeeNumber(String employeeNumber);
    boolean existsByWorkEmailIgnoreCase(String workEmail);
    boolean existsByDepartmentIdAndEmploymentStatusNot(UUID departmentId, EmploymentStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT e FROM Employee e WHERE " +
            "(LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(e.employeeNumber) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:departmentId IS NULL OR e.department.id = :departmentId) AND " +
            "(:employmentStatus IS NULL OR e.employmentStatus = :employmentStatus) AND " +
            "(:employmentType IS NULL OR CAST(e.employmentType AS string) = :employmentType) AND " +
            "(:skillId IS NULL OR EXISTS (SELECT 1 FROM EmployeeSkill es WHERE es.employee = e AND es.skill.id = :skillId))")
    Page<Employee> searchEmployees(
            @org.springframework.data.repository.query.Param("search") String search,
            @org.springframework.data.repository.query.Param("departmentId") UUID departmentId,
            @org.springframework.data.repository.query.Param("employmentStatus") EmploymentStatus employmentStatus,
            @org.springframework.data.repository.query.Param("employmentType") String employmentType,
            @org.springframework.data.repository.query.Param("skillId") UUID skillId,
            Pageable pageable);
}
