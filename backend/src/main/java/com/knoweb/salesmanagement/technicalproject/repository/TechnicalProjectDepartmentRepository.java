package com.knoweb.salesmanagement.technicalproject.repository;

import com.knoweb.salesmanagement.technicalproject.entity.TechnicalProjectDepartment;
import com.knoweb.salesmanagement.technicalproject.enums.TeamFormationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TechnicalProjectDepartmentRepository extends JpaRepository<TechnicalProjectDepartment, UUID> {

    List<TechnicalProjectDepartment> findByTechnicalProjectId(UUID technicalProjectId);

    Optional<TechnicalProjectDepartment> findByTechnicalProjectIdAndDepartmentId(UUID technicalProjectId, UUID departmentId);

    boolean existsByTechnicalProjectIdAndDepartmentId(UUID technicalProjectId, UUID departmentId);

    Page<TechnicalProjectDepartment> findByDepartmentIdAndFormationStatus(UUID departmentId, TeamFormationStatus status, Pageable pageable);

    /** HOD queue: all assignments for a department (any formation status), paginated. */
    Page<TechnicalProjectDepartment> findByDepartmentId(UUID departmentId, Pageable pageable);

    long countByTechnicalProjectId(UUID technicalProjectId);

    long countByTechnicalProjectIdAndFormationStatus(UUID technicalProjectId, TeamFormationStatus status);
}

