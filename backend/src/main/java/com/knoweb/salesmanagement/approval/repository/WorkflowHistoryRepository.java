package com.knoweb.salesmanagement.approval.repository;

import com.knoweb.salesmanagement.approval.entity.WorkflowHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkflowHistoryRepository extends JpaRepository<WorkflowHistory, UUID> {
    List<WorkflowHistory> findByOpportunityIdOrderByCreatedAtDesc(UUID opportunityId);
}
