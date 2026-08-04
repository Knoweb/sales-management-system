package com.knoweb.salesmanagement.technicalproject.repository;

import com.knoweb.salesmanagement.technicalproject.entity.ProjectTeamMember;
import com.knoweb.salesmanagement.technicalproject.enums.ProjectTeamMemberStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectTeamMemberRepository extends JpaRepository<ProjectTeamMember, UUID> {

    List<ProjectTeamMember> findByProjectTeamIdAndStatus(UUID projectTeamId, ProjectTeamMemberStatus status);

    /** All members regardless of status (for full team view). */
    List<ProjectTeamMember> findAllByProjectTeamId(UUID projectTeamId);

    boolean existsByProjectTeamIdAndEmployeeIdAndStatus(UUID projectTeamId, UUID employeeId, ProjectTeamMemberStatus status);

    Optional<ProjectTeamMember> findByIdAndProjectTeamId(UUID id, UUID projectTeamId);

    long countByProjectTeamIdAndStatus(UUID projectTeamId, ProjectTeamMemberStatus status);

    List<ProjectTeamMember> findByEmployeeIdAndStatus(UUID employeeId, ProjectTeamMemberStatus status);
}

