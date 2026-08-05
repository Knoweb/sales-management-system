package com.knoweb.salesmanagement.costing.repository;

import com.knoweb.salesmanagement.costing.entity.DepartmentTechnicalEstimate;
import com.knoweb.salesmanagement.costing.enums.DepartmentEstimateStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DepartmentTechnicalEstimateRepository extends JpaRepository<DepartmentTechnicalEstimate, UUID> {

    Optional<DepartmentTechnicalEstimate> findByTechnicalProjectIdAndDepartmentIdAndVersionNumber(
            UUID technicalProjectId, UUID departmentId, Integer versionNumber);

    List<DepartmentTechnicalEstimate> findByTechnicalProjectIdAndDepartmentIdOrderByVersionNumberDesc(
            UUID technicalProjectId, UUID departmentId);

    Optional<DepartmentTechnicalEstimate> findFirstByTechnicalProjectIdAndDepartmentIdOrderByVersionNumberDesc(
            UUID technicalProjectId, UUID departmentId);

    List<DepartmentTechnicalEstimate> findByTechnicalProjectId(UUID technicalProjectId);

    List<DepartmentTechnicalEstimate> findByTechnicalProjectIdAndStatus(
            UUID technicalProjectId, DepartmentEstimateStatus status);
}
