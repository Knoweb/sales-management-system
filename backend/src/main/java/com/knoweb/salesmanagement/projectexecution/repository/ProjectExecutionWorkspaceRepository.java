package com.knoweb.salesmanagement.projectexecution.repository;

import com.knoweb.salesmanagement.projectexecution.entity.ProjectExecutionWorkspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectExecutionWorkspaceRepository extends JpaRepository<ProjectExecutionWorkspace, UUID> {
    java.util.Optional<ProjectExecutionWorkspace> findByTechnicalProjectId(UUID technicalProjectId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"technicalProject", "projectManager"})
    List<ProjectExecutionWorkspace> findAll();

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"technicalProject", "projectManager"})
    java.util.Optional<ProjectExecutionWorkspace> findById(UUID id);
}
