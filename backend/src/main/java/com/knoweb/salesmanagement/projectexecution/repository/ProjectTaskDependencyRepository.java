package com.knoweb.salesmanagement.projectexecution.repository;

import com.knoweb.salesmanagement.projectexecution.entity.ProjectTaskDependency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectTaskDependencyRepository extends JpaRepository<ProjectTaskDependency, UUID> {
    List<ProjectTaskDependency> findByTaskId(UUID taskId);
}
