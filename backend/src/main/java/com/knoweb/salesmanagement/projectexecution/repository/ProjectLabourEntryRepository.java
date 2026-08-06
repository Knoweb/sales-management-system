package com.knoweb.salesmanagement.projectexecution.repository;

import com.knoweb.salesmanagement.projectexecution.entity.ProjectLabourEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectLabourEntryRepository extends JpaRepository<ProjectLabourEntry, UUID> {
    List<ProjectLabourEntry> findByWorkspaceId(UUID workspaceId);
}
