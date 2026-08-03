package com.knoweb.salesmanagement.approval.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class ClientVerificationRequest {
    @NotNull(message = "Opportunity ID is required")
    private UUID opportunityId;
    private String verifierName;
    private String verifierEmail;
    private java.time.OffsetDateTime expiresAt;

    public UUID getOpportunityId() { return opportunityId; }
    public void setOpportunityId(UUID opportunityId) { this.opportunityId = opportunityId; }
    public String getVerifierName() { return verifierName; }
    public void setVerifierName(String verifierName) { this.verifierName = verifierName; }
    public String getVerifierEmail() { return verifierEmail; }
    public void setVerifierEmail(String verifierEmail) { this.verifierEmail = verifierEmail; }
    public java.time.OffsetDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(java.time.OffsetDateTime expiresAt) { this.expiresAt = expiresAt; }
}
