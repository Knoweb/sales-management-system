package com.knoweb.salesmanagement.projectexecution.repository;

import com.knoweb.salesmanagement.projectexecution.entity.ProjectApprovalRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectApprovalRequestRepository extends JpaRepository<ProjectApprovalRequest, UUID> {
    List<ProjectApprovalRequest> findByWorkspaceId(UUID workspaceId);
}
