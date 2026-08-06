package com.knoweb.salesmanagement.projectexecution.repository;

import com.knoweb.salesmanagement.projectexecution.entity.ProjectChangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectChangeRequestRepository extends JpaRepository<ProjectChangeRequest, UUID> {
    List<ProjectChangeRequest> findByWorkspaceId(UUID workspaceId);
}
