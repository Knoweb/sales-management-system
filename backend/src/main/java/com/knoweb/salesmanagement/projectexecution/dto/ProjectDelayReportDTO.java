package com.knoweb.salesmanagement.projectexecution.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public class ProjectDelayReportDTO {
    private UUID id;
    
    @NotNull(message = "Workspace ID is required")
    private UUID workspaceId;
    
    private UUID taskId;
    private String taskTitle;
    
    @NotBlank(message = "Reason is required")
    private String reason;
    
    @NotNull(message = "Expected delay days is required")
    private Integer expectedDelayDays;
    
    @NotNull(message = "Revised expected date is required")
    private LocalDate revisedExpectedDate;
    
    private String impactDescription;
    private String mitigationPlan;
    private String status;
    
    private UUID reportedBy;
    private UUID reviewedById;
    private String reviewedByName;
    private OffsetDateTime createdAt;
    
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getWorkspaceId() { return workspaceId; }
    public void setWorkspaceId(UUID workspaceId) { this.workspaceId = workspaceId; }
    public UUID getTaskId() { return taskId; }
    public void setTaskId(UUID taskId) { this.taskId = taskId; }
    public String getTaskTitle() { return taskTitle; }
    public void setTaskTitle(String taskTitle) { this.taskTitle = taskTitle; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public Integer getExpectedDelayDays() { return expectedDelayDays; }
    public void setExpectedDelayDays(Integer expectedDelayDays) { this.expectedDelayDays = expectedDelayDays; }
    public LocalDate getRevisedExpectedDate() { return revisedExpectedDate; }
    public void setRevisedExpectedDate(LocalDate revisedExpectedDate) { this.revisedExpectedDate = revisedExpectedDate; }
    public String getImpactDescription() { return impactDescription; }
    public void setImpactDescription(String impactDescription) { this.impactDescription = impactDescription; }
    public String getMitigationPlan() { return mitigationPlan; }
    public void setMitigationPlan(String mitigationPlan) { this.mitigationPlan = mitigationPlan; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public UUID getReportedBy() { return reportedBy; }
    public void setReportedBy(UUID reportedBy) { this.reportedBy = reportedBy; }
    public UUID getReviewedById() { return reviewedById; }
    public void setReviewedById(UUID reviewedById) { this.reviewedById = reviewedById; }
    public String getReviewedByName() { return reviewedByName; }
    public void setReviewedByName(String reviewedByName) { this.reviewedByName = reviewedByName; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
