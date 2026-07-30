package com.knoweb.salesmanagement.lead.repository;

import com.knoweb.salesmanagement.lead.entity.Lead;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface LeadRepository extends JpaRepository<Lead, UUID> {
    
    @Query("SELECT l FROM Lead l WHERE " +
           "(:search IS NULL OR LOWER(l.title) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR l.status = :status) " +
           "AND (:assignedTo IS NULL OR l.assignedTo.id = :assignedTo) " +
           "AND (:active IS NULL OR l.active = :active)")
    Page<Lead> searchLeads(
            @Param("search") String search, 
            @Param("status") String status, 
            @Param("assignedTo") UUID assignedTo, 
            @Param("active") Boolean active, 
            Pageable pageable);
}
