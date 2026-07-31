package com.knoweb.salesmanagement.opportunity.repository;

import com.knoweb.salesmanagement.opportunity.entity.OpportunityActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OpportunityActivityRepository extends JpaRepository<OpportunityActivity, UUID> {
    List<OpportunityActivity> findByOpportunityIdOrderByActivityDateDesc(UUID opportunityId);
}
