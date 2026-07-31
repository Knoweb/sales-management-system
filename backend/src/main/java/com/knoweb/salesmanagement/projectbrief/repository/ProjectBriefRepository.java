package com.knoweb.salesmanagement.projectbrief.repository;

import com.knoweb.salesmanagement.projectbrief.entity.ProjectBrief;
import com.knoweb.salesmanagement.projectbrief.enums.ProjectBriefStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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
}
