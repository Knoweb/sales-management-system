package com.knoweb.salesmanagement.approval.repository;

import com.knoweb.salesmanagement.approval.entity.BdmApprovalComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BdmApprovalCommentRepository extends JpaRepository<BdmApprovalComment, UUID> {
    List<BdmApprovalComment> findByBdmApprovalIdOrderByCreatedAtAsc(UUID bdmApprovalId);
}
