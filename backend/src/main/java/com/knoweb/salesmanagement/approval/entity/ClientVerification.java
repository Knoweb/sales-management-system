package com.knoweb.salesmanagement.approval.entity;

import com.knoweb.salesmanagement.approval.enums.ClientVerificationStatus;
import com.knoweb.salesmanagement.opportunity.entity.SalesOpportunity;
import com.knoweb.salesmanagement.projectbrief.entity.ProjectBrief;
import com.knoweb.salesmanagement.user.entity.User;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "client_verifications")
public class ClientVerification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opportunity_id", nullable = false)
    private SalesOpportunity opportunity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_brief_id", nullable = false)
    private ProjectBrief projectBrief;

    @Column(name = "project_brief_version_number", nullable = false)
    private Integer projectBriefVersionNumber;

    @Column(name = "token_hash", nullable = false, length = 255)
    private String tokenHash;

    @Column(name = "encrypted_token", length = 255)
    private String encryptedToken;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ClientVerificationStatus status;

    @Column(name = "verifier_name", length = 255)
    private String verifierName;

    @Column(name = "verifier_email", length = 255)
    private String verifierEmail;

    @Column(name = "client_comments", columnDefinition = "TEXT")
    private String clientComments;

    @Column(name = "requested_changes", columnDefinition = "TEXT")
    private String requestedChanges;

    @Column(name = "digital_confirmation", nullable = false)
    private Boolean digitalConfirmation = false;

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    @Column(name = "decision_date")
    private OffsetDateTime decisionDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public ClientVerification() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public SalesOpportunity getOpportunity() { return opportunity; }
    public void setOpportunity(SalesOpportunity opportunity) { this.opportunity = opportunity; }
    public ProjectBrief getProjectBrief() { return projectBrief; }
    public void setProjectBrief(ProjectBrief projectBrief) { this.projectBrief = projectBrief; }
    public Integer getProjectBriefVersionNumber() { return projectBriefVersionNumber; }
    public void setProjectBriefVersionNumber(Integer projectBriefVersionNumber) { this.projectBriefVersionNumber = projectBriefVersionNumber; }
    public String getTokenHash() { return tokenHash; }
    public void setTokenHash(String tokenHash) { this.tokenHash = tokenHash; }
    public String getEncryptedToken() { return encryptedToken; }
    public void setEncryptedToken(String encryptedToken) { this.encryptedToken = encryptedToken; }
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
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
