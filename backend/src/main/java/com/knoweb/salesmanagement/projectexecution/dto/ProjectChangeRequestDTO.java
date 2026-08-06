package com.knoweb.salesmanagement.projectexecution.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public class ProjectChangeRequestDTO {
    private UUID id;
    
    @NotNull(message = "Workspace ID is required")
    private UUID workspaceId;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @NotBlank(message = "Reason is required")
    private String reason;
    
    private String impactDescription;
    private BigDecimal estimatedCostImpact;
    private Integer estimatedScheduleImpactDays;
    
    private String status;
    private String decisionComment;
    
    private UUID requestedBy;
    private UUID reviewedById;
    private String reviewedByName;
    
    private OffsetDateTime submittedDate;
    private OffsetDateTime reviewedDate;
    private OffsetDateTime createdAt;
    
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getWorkspaceId() { return workspaceId; }
    public void setWorkspaceId(UUID workspaceId) { this.workspaceId = workspaceId; }
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
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDecisionComment() { return decisionComment; }
    public void setDecisionComment(String decisionComment) { this.decisionComment = decisionComment; }
    public UUID getRequestedBy() { return requestedBy; }
    public void setRequestedBy(UUID requestedBy) { this.requestedBy = requestedBy; }
    public UUID getReviewedById() { return reviewedById; }
    public void setReviewedById(UUID reviewedById) { this.reviewedById = reviewedById; }
    public String getReviewedByName() { return reviewedByName; }
    public void setReviewedByName(String reviewedByName) { this.reviewedByName = reviewedByName; }
    public OffsetDateTime getSubmittedDate() { return submittedDate; }
    public void setSubmittedDate(OffsetDateTime submittedDate) { this.submittedDate = submittedDate; }
    public OffsetDateTime getReviewedDate() { return reviewedDate; }
    public void setReviewedDate(OffsetDateTime reviewedDate) { this.reviewedDate = reviewedDate; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
