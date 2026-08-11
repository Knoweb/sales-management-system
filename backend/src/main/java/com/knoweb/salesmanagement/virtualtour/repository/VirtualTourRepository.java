package com.knoweb.salesmanagement.virtualtour.repository;

import com.knoweb.salesmanagement.virtualtour.entity.VirtualTour;
import com.knoweb.salesmanagement.virtualtour.enums.VirtualTourStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface VirtualTourRepository extends JpaRepository<VirtualTour, UUID> {

    List<VirtualTour> findByLeadIdOrderByTourDateDesc(UUID leadId);

    List<VirtualTour> findByOpportunityIdOrderByTourDateDesc(UUID opportunityId);

    @Query("SELECT v FROM VirtualTour v WHERE v.status = :status AND v.tourDate >= :now ORDER BY v.tourDate ASC")
    List<VirtualTour> findUpcomingTours(@Param("status") VirtualTourStatus status, @Param("now") OffsetDateTime now);
    
    @Query("SELECT COUNT(v) FROM VirtualTour v WHERE v.status = :status AND v.tourDate BETWEEN :startDate AND :endDate")
    long countByStatusAndDateRange(@Param("status") VirtualTourStatus status, 
                                   @Param("startDate") OffsetDateTime startDate, 
                                   @Param("endDate") OffsetDateTime endDate);

    @Query("SELECT v FROM VirtualTour v WHERE v.status = :status AND v.tourDate BETWEEN :startDate AND :endDate")
    List<VirtualTour> findByStatusAndDateRange(@Param("status") VirtualTourStatus status, 
                                               @Param("startDate") OffsetDateTime startDate, 
                                               @Param("endDate") OffsetDateTime endDate);
}
