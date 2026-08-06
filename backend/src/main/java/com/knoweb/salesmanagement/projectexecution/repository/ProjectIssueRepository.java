package com.knoweb.salesmanagement.projectexecution.repository;

import com.knoweb.salesmanagement.projectexecution.entity.ProjectIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectIssueRepository extends JpaRepository<ProjectIssue, UUID> {
    List<ProjectIssue> findByWorkspaceId(UUID workspaceId);
}
