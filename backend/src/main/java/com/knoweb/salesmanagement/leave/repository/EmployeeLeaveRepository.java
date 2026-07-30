package com.knoweb.salesmanagement.leave.repository;

import com.knoweb.salesmanagement.leave.entity.EmployeeLeave;
import com.knoweb.salesmanagement.leave.enums.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface EmployeeLeaveRepository extends JpaRepository<EmployeeLeave, UUID> {
    List<EmployeeLeave> findByEmployeeIdOrderByStartDateDesc(UUID employeeId);

    @Query("SELECT COUNT(l) > 0 FROM EmployeeLeave l WHERE l.employee.id = :employeeId " +
           "AND l.status = :status AND (" +
           "(l.startDate <= :endDate AND l.endDate >= :startDate))")
    boolean existsOverlappingLeave(
            @Param("employeeId") UUID employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("status") LeaveStatus status
    );

    @Query("SELECT l FROM EmployeeLeave l WHERE l.employee.id = :employeeId " +
           "AND l.status = :status AND l.startDate <= :endDate AND l.endDate >= :startDate")
    List<EmployeeLeave> findOverlappingLeaves(
            @Param("employeeId") UUID employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("status") LeaveStatus status
    );
}
