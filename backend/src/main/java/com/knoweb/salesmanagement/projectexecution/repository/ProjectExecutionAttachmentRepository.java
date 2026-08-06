package com.knoweb.salesmanagement.projectexecution.repository;

import com.knoweb.salesmanagement.projectexecution.entity.ProjectExecutionAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectExecutionAttachmentRepository extends JpaRepository<ProjectExecutionAttachment, UUID> {
    List<ProjectExecutionAttachment> findByWorkspaceId(UUID workspaceId);
}
