package com.knoweb.salesmanagement.technicalproject.repository;

import com.knoweb.salesmanagement.technicalproject.entity.TechnicalProjectHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TechnicalProjectHistoryRepository extends JpaRepository<TechnicalProjectHistory, UUID> {

    List<TechnicalProjectHistory> findByTechnicalProjectIdOrderByActedAtDesc(UUID technicalProjectId);

    List<TechnicalProjectHistory> findByEntityTypeAndEntityIdOrderByActedAtDesc(String entityType, UUID entityId);
}
