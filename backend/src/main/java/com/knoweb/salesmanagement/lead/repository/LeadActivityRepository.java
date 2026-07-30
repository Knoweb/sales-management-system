package com.knoweb.salesmanagement.lead.repository;

import com.knoweb.salesmanagement.lead.entity.LeadActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LeadActivityRepository extends JpaRepository<LeadActivity, UUID> {
    List<LeadActivity> findByLeadIdOrderByActivityDateDesc(UUID leadId);
}
