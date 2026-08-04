package com.knoweb.salesmanagement.technicalproject.repository;

import com.knoweb.salesmanagement.technicalproject.entity.TechnicalProject;
import com.knoweb.salesmanagement.technicalproject.enums.TechnicalProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TechnicalProjectRepository extends JpaRepository<TechnicalProject, UUID> {

    Optional<TechnicalProject> findByProjectCode(String projectCode);

    Optional<TechnicalProject> findByProjectBriefId(UUID projectBriefId);

    boolean existsByProjectBriefId(UUID projectBriefId);

    boolean existsByProjectCode(String projectCode);

    List<TechnicalProject> findByTechnicalCoordinatorId(UUID technicalCoordinatorId);

    Page<TechnicalProject> findByStatus(TechnicalProjectStatus status, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT tp FROM TechnicalProject tp " +
        "LEFT JOIN tp.projectBrief pb " +
        "WHERE (:status IS NULL OR tp.status = :status) " +
        "AND (:search IS NULL OR LOWER(tp.projectCode) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
        "OR LOWER(pb.projectTitle) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))")
    Page<TechnicalProject> searchProjects(@org.springframework.data.repository.query.Param("search") String search, 
                                          @org.springframework.data.repository.query.Param("status") TechnicalProjectStatus status, 
                                          Pageable pageable);
}
