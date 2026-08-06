package com.knoweb.salesmanagement.projectexecution.repository;

import com.knoweb.salesmanagement.projectexecution.entity.ProjectMaterialUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectMaterialUsageRepository extends JpaRepository<ProjectMaterialUsage, UUID> {
    List<ProjectMaterialUsage> findByWorkspaceId(UUID workspaceId);
}
