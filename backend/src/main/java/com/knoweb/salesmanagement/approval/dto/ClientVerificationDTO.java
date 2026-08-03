package com.knoweb.salesmanagement.approval.dto;

import com.knoweb.salesmanagement.approval.enums.ClientVerificationStatus;
import java.time.OffsetDateTime;
import java.util.UUID;

public class ClientVerificationDTO {
    private UUID id;
    private UUID opportunityId;
    private UUID projectBriefId;
    private Integer projectBriefVersionNumber;
    private ClientVerificationStatus status;
    private String verifierName;
    private String verifierEmail;
    private String clientComments;
    private String requestedChanges;
    private Boolean digitalConfirmation;
    private OffsetDateTime expiresAt;
    private OffsetDateTime decisionDate;
    private OffsetDateTime createdAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getOpportunityId() { return opportunityId; }
    public void setOpportunityId(UUID opportunityId) { this.opportunityId = opportunityId; }
    public UUID getProjectBriefId() { return projectBriefId; }
    public void setProjectBriefId(UUID projectBriefId) { this.projectBriefId = projectBriefId; }
    public Integer getProjectBriefVersionNumber() { return projectBriefVersionNumber; }
    public void setProjectBriefVersionNumber(Integer projectBriefVersionNumber) { this.projectBriefVersionNumber = projectBriefVersionNumber; }
    public ClientVerificationStatus getStatus() { return status; }
    public void setStatus(ClientVerificationStatus status) { this.status = status; }
    public String getVerifierName() { return verifierName; }
    public void setVerifierName(String verifierName) { this.verifierName = verifierName; }
    public String getVerifierEmail() { return verifierEmail; }
    public void setVerifierEmail(String verifierEmail) { this.verifierEmail = verifierEmail; }
    public String getClientComments() { return clientComments; }
    public void setClientComments(String clientComments) { this.clientComments = clientComments; }
    public String getRequestedChanges() { return requestedChanges; }
    public void setRequestedChanges(String requestedChanges) { this.requestedChanges = requestedChanges; }
    public Boolean getDigitalConfirmation() { return digitalConfirmation; }
    public void setDigitalConfirmation(Boolean digitalConfirmation) { this.digitalConfirmation = digitalConfirmation; }
    public OffsetDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(OffsetDateTime expiresAt) { this.expiresAt = expiresAt; }
    public OffsetDateTime getDecisionDate() { return decisionDate; }
    public void setDecisionDate(OffsetDateTime decisionDate) { this.decisionDate = decisionDate; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
