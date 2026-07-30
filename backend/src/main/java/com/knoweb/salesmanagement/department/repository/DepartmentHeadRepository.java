package com.knoweb.salesmanagement.department.repository;

import com.knoweb.salesmanagement.department.entity.DepartmentHead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DepartmentHeadRepository extends JpaRepository<DepartmentHead, UUID> {
    Optional<DepartmentHead> findByDepartmentIdAndActiveTrue(UUID departmentId);
    Optional<DepartmentHead> findByEmployeeIdAndActiveTrue(UUID employeeId);
    boolean existsByEmployeeIdAndActiveTrue(UUID employeeId);
}
