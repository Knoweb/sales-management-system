package com.knoweb.salesmanagement.lead.repository;

import com.knoweb.salesmanagement.lead.entity.FollowUp;
import com.knoweb.salesmanagement.lead.enums.FollowUpStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.UUID;

public interface FollowUpRepository extends JpaRepository<FollowUp, UUID>, JpaSpecificationExecutor<FollowUp> {
    List<FollowUp> findByLeadIdOrderByFollowUpDateAsc(UUID leadId);

    List<FollowUp> findByQuotationIdAndStatus(UUID quotationId, FollowUpStatus status);
}
