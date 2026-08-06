package com.knoweb.salesmanagement.quotation.repository;

import com.knoweb.salesmanagement.quotation.entity.QuotationApprovalHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuotationApprovalHistoryRepository extends JpaRepository<QuotationApprovalHistory, UUID> {
    List<QuotationApprovalHistory> findByQuotationIdOrderByCreatedAtDesc(UUID quotationId);
}
