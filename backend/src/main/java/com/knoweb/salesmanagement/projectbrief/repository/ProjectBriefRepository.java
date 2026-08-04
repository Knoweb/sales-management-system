package com.knoweb.salesmanagement.projectbrief.repository;

import com.knoweb.salesmanagement.approval.enums.BdmApprovalStatus;
import com.knoweb.salesmanagement.approval.enums.ClientVerificationStatus;
import com.knoweb.salesmanagement.projectbrief.entity.ProjectBrief;
import com.knoweb.salesmanagement.projectbrief.enums.ProjectBriefStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectBriefRepository extends JpaRepository<ProjectBrief, UUID> {
    Optional<ProjectBrief> findByOpportunityId(UUID opportunityId);
    
    @Query("SELECT pb FROM ProjectBrief pb WHERE pb.status = :status AND pb.dueAt < :now")
    List<ProjectBrief> findOverdueBriefs(ProjectBriefStatus status, OffsetDateTime now);

    @Query("SELECT pb FROM ProjectBrief pb " +
           "WHERE pb.status NOT IN :invalidStatuses " +
           "AND NOT EXISTS (SELECT tp FROM TechnicalProject tp WHERE tp.projectBrief = pb) " +
           "AND EXISTS (SELECT cv FROM ClientVerification cv WHERE cv.projectBrief = pb " +
           "  AND cv.projectBriefVersionNumber = pb.currentVersionNumber " +
           "  AND cv.status = :verificationStatus) " +
           "AND EXISTS (SELECT ba FROM BdmApproval ba WHERE ba.projectBrief = pb " +
           "  AND ba.projectBriefVersionNumber = pb.currentVersionNumber " +
           "  AND ba.status = :approvalStatus)")
    Page<ProjectBrief> findEligibleForTechnicalRouting(
        @Param("invalidStatuses") List<ProjectBriefStatus> invalidStatuses,
        @Param("verificationStatus") ClientVerificationStatus verificationStatus,
        @Param("approvalStatus") BdmApprovalStatus approvalStatus,
        Pageable pageable
    );
}
