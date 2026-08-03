package com.knoweb.salesmanagement.approval.repository;

import com.knoweb.salesmanagement.approval.entity.ClientVerification;
import com.knoweb.salesmanagement.approval.enums.ClientVerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClientVerificationRepository extends JpaRepository<ClientVerification, UUID> {
    Optional<ClientVerification> findByTokenHash(String tokenHash);
    Optional<ClientVerification> findByProjectBriefIdAndProjectBriefVersionNumberAndStatus(UUID projectBriefId, Integer versionNumber, ClientVerificationStatus status);
    List<ClientVerification> findByOpportunityIdOrderByCreatedAtDesc(UUID opportunityId);
}
