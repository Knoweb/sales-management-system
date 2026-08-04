package com.knoweb.salesmanagement.technicalproject.repository;

import com.knoweb.salesmanagement.technicalproject.entity.ProjectTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectTeamRepository extends JpaRepository<ProjectTeam, UUID> {

    Optional<ProjectTeam> findByTechnicalProjectDepartmentId(UUID technicalProjectDepartmentId);

    boolean existsByTechnicalProjectDepartmentId(UUID technicalProjectDepartmentId);

    @Query("SELECT pt FROM ProjectTeam pt " +
           "JOIN FETCH pt.technicalProjectDepartment tpd " +
           "JOIN FETCH tpd.technicalProject " +
           "JOIN FETCH tpd.department " +
           "WHERE pt.id = :id")
    Optional<ProjectTeam> findByIdWithDetails(@Param("id") UUID id);
}
