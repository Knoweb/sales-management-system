package com.knoweb.salesmanagement.projectbrief.repository;

import com.knoweb.salesmanagement.projectbrief.entity.ProjectBriefVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectBriefVersionRepository extends JpaRepository<ProjectBriefVersion, UUID> {
    List<ProjectBriefVersion> findByProjectBriefIdOrderByVersionNumberDesc(UUID projectBriefId);
    Optional<ProjectBriefVersion> findByProjectBriefIdAndVersionNumber(UUID projectBriefId, Integer versionNumber);
}
