package com.knoweb.salesmanagement.projectbrief.repository;

import com.knoweb.salesmanagement.projectbrief.entity.ProjectBriefAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectBriefAttachmentRepository extends JpaRepository<ProjectBriefAttachment, UUID> {
    List<ProjectBriefAttachment> findByProjectBriefIdOrderByCreatedAtDesc(UUID projectBriefId);
}
