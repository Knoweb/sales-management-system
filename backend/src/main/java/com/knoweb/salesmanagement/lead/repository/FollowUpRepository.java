package com.knoweb.salesmanagement.lead.repository;

import com.knoweb.salesmanagement.lead.entity.FollowUp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FollowUpRepository extends JpaRepository<FollowUp, UUID> {
    List<FollowUp> findByLeadIdOrderByFollowUpDateAsc(UUID leadId);
}
