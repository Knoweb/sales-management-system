package com.knoweb.salesmanagement.costing.repository;

import com.knoweb.salesmanagement.costing.entity.ConsolidatedTechnicalEstimate;
import com.knoweb.salesmanagement.costing.enums.ConsolidatedEstimateStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConsolidatedTechnicalEstimateRepository extends JpaRepository<ConsolidatedTechnicalEstimate, UUID> {

    Optional<ConsolidatedTechnicalEstimate> findByTechnicalProjectIdAndVersionNumber(
            UUID technicalProjectId, Integer versionNumber);

    List<ConsolidatedTechnicalEstimate> findByTechnicalProjectIdOrderByVersionNumberDesc(
            UUID technicalProjectId);

    Optional<ConsolidatedTechnicalEstimate> findFirstByTechnicalProjectIdOrderByVersionNumberDesc(
            UUID technicalProjectId);

    Optional<ConsolidatedTechnicalEstimate> findFirstByTechnicalProjectIdAndStatusOrderByVersionNumberDesc(
            UUID technicalProjectId, ConsolidatedEstimateStatus status);

    boolean existsByTechnicalProjectIdAndStatus(
            UUID technicalProjectId, ConsolidatedEstimateStatus status);
}
