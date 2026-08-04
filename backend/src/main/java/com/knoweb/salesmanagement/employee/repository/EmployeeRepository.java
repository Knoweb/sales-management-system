package com.knoweb.salesmanagement.employee.repository;

import com.knoweb.salesmanagement.employee.entity.Employee;
import com.knoweb.salesmanagement.employee.enums.EmploymentStatus;
import com.knoweb.salesmanagement.employee.enums.EmploymentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
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
    
    long countByDepartmentIdAndEmploymentStatus(UUID departmentId, EmploymentStatus status);

    /** All active employees in a department (for availability search). */
    List<Employee> findByDepartmentIdAndEmploymentStatus(UUID departmentId, EmploymentStatus status);

    /** Alias: active employees by department. */
    default List<Employee> findActiveByDepartmentId(UUID departmentId) {
        return findByDepartmentIdAndEmploymentStatus(departmentId, EmploymentStatus.ACTIVE);
    }

    /** All employees with given status (no department filter). */
    List<Employee> findByEmploymentStatus(EmploymentStatus status);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"department", "user"})
    @Query("SELECT e FROM Employee e WHERE " +
            "(LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(e.employeeNumber) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:departmentId IS NULL OR e.department.id = :departmentId) AND " +
            "(:employmentStatus IS NULL OR e.employmentStatus = :employmentStatus) AND " +
            "(:employmentType IS NULL OR CAST(e.employmentType AS string) = :employmentType) AND " +
            "(:skillId IS NULL OR EXISTS (SELECT 1 FROM EmployeeSkill es WHERE es.employee = e AND es.skill.id = :skillId))")
    Page<Employee> searchEmployees(
            @Param("search") String search,
            @Param("departmentId") UUID departmentId,
            @Param("employmentStatus") EmploymentStatus employmentStatus,
            @Param("employmentType") String employmentType,
            @Param("skillId") UUID skillId,
            Pageable pageable);
}
