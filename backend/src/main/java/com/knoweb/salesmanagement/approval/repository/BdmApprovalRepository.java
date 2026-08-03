package com.knoweb.salesmanagement.approval.repository;

import com.knoweb.salesmanagement.approval.entity.BdmApproval;
import com.knoweb.salesmanagement.approval.enums.BdmApprovalStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BdmApprovalRepository extends JpaRepository<BdmApproval, UUID> {
    Optional<BdmApproval> findByProjectBriefIdAndProjectBriefVersionNumberAndStatus(UUID projectBriefId, Integer versionNumber, BdmApprovalStatus status);
    @EntityGraph(attributePaths = {"opportunity", "opportunity.client", "opportunity.assignedSalesOfficer", "opportunity.assignedSalesOfficer.user", "projectBrief", "decisionMaker"})
    Optional<BdmApproval> findById(UUID id);

    @EntityGraph(attributePaths = {"opportunity", "opportunity.client", "opportunity.assignedSalesOfficer", "opportunity.assignedSalesOfficer.user", "projectBrief", "decisionMaker"})
    List<BdmApproval> findByOpportunityIdOrderByCreatedAtDesc(UUID opportunityId);

    @EntityGraph(attributePaths = {"opportunity", "opportunity.client", "opportunity.assignedSalesOfficer", "opportunity.assignedSalesOfficer.user", "projectBrief", "decisionMaker"})
    List<BdmApproval> findByStatusOrderByCreatedAtDesc(BdmApprovalStatus status);
}
