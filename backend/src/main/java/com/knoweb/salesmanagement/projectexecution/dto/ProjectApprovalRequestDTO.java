package com.knoweb.salesmanagement.projectexecution.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.UUID;

public class ProjectApprovalRequestDTO {
    private UUID id;
    
    @NotNull(message = "Workspace ID is required")
    private UUID workspaceId;
    
    private UUID taskId;
    private String taskTitle;
    
    @NotBlank(message = "Approval type is required")
    private String approvalType;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    private String status;
    private String decisionComment;
    
    private UUID requestedBy;
    private UUID assignedApproverId;
    private String assignedApproverName;
    
    private OffsetDateTime submittedDate;
    private OffsetDateTime decisionDate;
    private OffsetDateTime createdAt;
    
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getWorkspaceId() { return workspaceId; }
    public void setWorkspaceId(UUID workspaceId) { this.workspaceId = workspaceId; }
    public UUID getTaskId() { return taskId; }
    public void setTaskId(UUID taskId) { this.taskId = taskId; }
    public String getTaskTitle() { return taskTitle; }
    public void setTaskTitle(String taskTitle) { this.taskTitle = taskTitle; }
    public String getApprovalType() { return approvalType; }
    public void setApprovalType(String approvalType) { this.approvalType = approvalType; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDecisionComment() { return decisionComment; }
    public void setDecisionComment(String decisionComment) { this.decisionComment = decisionComment; }
    public UUID getRequestedBy() { return requestedBy; }
    public void setRequestedBy(UUID requestedBy) { this.requestedBy = requestedBy; }
    public UUID getAssignedApproverId() { return assignedApproverId; }
    public void setAssignedApproverId(UUID assignedApproverId) { this.assignedApproverId = assignedApproverId; }
    public String getAssignedApproverName() { return assignedApproverName; }
    public void setAssignedApproverName(String assignedApproverName) { this.assignedApproverName = assignedApproverName; }
    public OffsetDateTime getSubmittedDate() { return submittedDate; }
    public void setSubmittedDate(OffsetDateTime submittedDate) { this.submittedDate = submittedDate; }
    public OffsetDateTime getDecisionDate() { return decisionDate; }
    public void setDecisionDate(OffsetDateTime decisionDate) { this.decisionDate = decisionDate; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
