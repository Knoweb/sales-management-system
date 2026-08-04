package com.knoweb.salesmanagement.technicalproject.repository;

import com.knoweb.salesmanagement.technicalproject.entity.EmployeeAllocation;
import com.knoweb.salesmanagement.technicalproject.enums.EmployeeAllocationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface EmployeeAllocationRepository extends JpaRepository<EmployeeAllocation, UUID> {

    @Query("SELECT ea FROM EmployeeAllocation ea " +
           "WHERE ea.employee.id = :employeeId " +
           "AND ea.status = :status " +
           "AND ea.allocationStartDate <= :endDate " +
           "AND ea.allocationEndDate >= :startDate")
    List<EmployeeAllocation> findActiveOverlappingAllocations(
            @Param("employeeId") UUID employeeId, 
            @Param("startDate") LocalDate startDate, 
            @Param("endDate") LocalDate endDate,
            @Param("status") EmployeeAllocationStatus status);

    @Query("SELECT COALESCE(SUM(ea.assignedHours), 0) FROM EmployeeAllocation ea " +
           "WHERE ea.employee.id = :employeeId " +
           "AND ea.status = :status " +
           "AND ea.allocationStartDate <= :endDate " +
           "AND ea.allocationEndDate >= :startDate")
    BigDecimal sumActiveOverlappingHours(
            @Param("employeeId") UUID employeeId, 
            @Param("startDate") LocalDate startDate, 
            @Param("endDate") LocalDate endDate,
            @Param("status") EmployeeAllocationStatus status);

    @Query("SELECT COUNT(DISTINCT ea.technicalProject.id) FROM EmployeeAllocation ea " +
           "WHERE ea.employee.id = :employeeId " +
           "AND ea.status = :status " +
           "AND ea.allocationStartDate <= :endDate " +
           "AND ea.allocationEndDate >= :startDate")
    long countDistinctActiveProjectsForEmployeeOverlapping(
            @Param("employeeId") UUID employeeId, 
            @Param("startDate") LocalDate startDate, 
            @Param("endDate") LocalDate endDate,
            @Param("status") EmployeeAllocationStatus status);

    boolean existsByEmployeeIdAndProjectTeamIdAndAllocationStartDateAndAllocationEndDateAndStatus(
            UUID employeeId, UUID projectTeamId, LocalDate startDate, LocalDate endDate, EmployeeAllocationStatus status);

    List<EmployeeAllocation> findByTechnicalProjectIdAndStatus(UUID technicalProjectId, EmployeeAllocationStatus status);

    List<EmployeeAllocation> findByProjectTeamIdAndStatus(UUID projectTeamId, EmployeeAllocationStatus status);

    List<EmployeeAllocation> findByDepartmentIdAndStatus(UUID departmentId, EmployeeAllocationStatus status);
}
