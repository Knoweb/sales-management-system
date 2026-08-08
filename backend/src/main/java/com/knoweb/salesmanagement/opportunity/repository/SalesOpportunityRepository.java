package com.knoweb.salesmanagement.opportunity.repository;

import com.knoweb.salesmanagement.opportunity.entity.SalesOpportunity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SalesOpportunityRepository extends JpaRepository<SalesOpportunity, UUID>, JpaSpecificationExecutor<SalesOpportunity> {
    boolean existsByOpportunityNumber(String opportunityNumber);
    boolean existsByLeadId(UUID leadId);
    java.util.Optional<SalesOpportunity> findByLeadId(UUID leadId);
}
