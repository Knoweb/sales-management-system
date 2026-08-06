package com.knoweb.salesmanagement.projectexecution.entity;

import com.knoweb.salesmanagement.projectexecution.enums.ChangeRequestStatus;
import com.knoweb.salesmanagement.user.entity.User;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "project_change_requests")
public class ProjectChangeRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private ProjectExecutionWorkspace workspace;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "impact_description", columnDefinition = "TEXT")
    private String impactDescription;

    @Column(name = "estimated_cost_impact", precision = 19, scale = 2)
    private BigDecimal estimatedCostImpact;

    @Column(name = "estimated_schedule_impact_days")
    private Integer estimatedScheduleImpactDays;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private ChangeRequestStatus status = ChangeRequestStatus.DRAFT;

    @Column(name = "requested_by")
    private UUID requestedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "submitted_date")
    private OffsetDateTime submittedDate;

    @Column(name = "reviewed_date")
    private OffsetDateTime reviewedDate;

    @Column(name = "decision_comment", columnDefinition = "TEXT")
    private String decisionComment;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private Integer version = 0;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public ProjectExecutionWorkspace getWorkspace() { return workspace; }
    public void setWorkspace(ProjectExecutionWorkspace workspace) { this.workspace = workspace; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getImpactDescription() { return impactDescription; }
    public void setImpactDescription(String impactDescription) { this.impactDescription = impactDescription; }
    public BigDecimal getEstimatedCostImpact() { return estimatedCostImpact; }
    public void setEstimatedCostImpact(BigDecimal estimatedCostImpact) { this.estimatedCostImpact = estimatedCostImpact; }
    public Integer getEstimatedScheduleImpactDays() { return estimatedScheduleImpactDays; }
    public void setEstimatedScheduleImpactDays(Integer estimatedScheduleImpactDays) { this.estimatedScheduleImpactDays = estimatedScheduleImpactDays; }
    public ChangeRequestStatus getStatus() { return status; }
    public void setStatus(ChangeRequestStatus status) { this.status = status; }
    public UUID getRequestedBy() { return requestedBy; }
    public void setRequestedBy(UUID requestedBy) { this.requestedBy = requestedBy; }
    public User getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(User reviewedBy) { this.reviewedBy = reviewedBy; }
    public OffsetDateTime getSubmittedDate() { return submittedDate; }
    public void setSubmittedDate(OffsetDateTime submittedDate) { this.submittedDate = submittedDate; }
    public OffsetDateTime getReviewedDate() { return reviewedDate; }
    public void setReviewedDate(OffsetDateTime reviewedDate) { this.reviewedDate = reviewedDate; }
    public String getDecisionComment() { return decisionComment; }
    public void setDecisionComment(String decisionComment) { this.decisionComment = decisionComment; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }
}
