package com.knoweb.salesmanagement.approval.dto;

import com.knoweb.salesmanagement.approval.enums.BdmApprovalStatus;
import com.knoweb.salesmanagement.projectbrief.enums.ProjectBriefStatus;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class BdmApprovalDTO {
    private UUID id;
    private UUID opportunityId;
    private UUID projectBriefId;
    private Integer projectBriefVersionNumber;
    private BdmApprovalStatus status;
    private ProjectBriefStatus projectBriefStatus;
    private UUID decisionMakerId;
    private String decisionMakerName;
    private OffsetDateTime decisionDate;
    private OffsetDateTime createdAt;
    private List<BdmApprovalCommentDTO> comments;
    
    private String opportunityNumber;
    private String opportunityTitle;
    private String clientName;
    private UUID assignedSalesOfficerId;
    private String assignedSalesOfficerName;

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getOpportunityId() { return opportunityId; }
    public void setOpportunityId(UUID opportunityId) { this.opportunityId = opportunityId; }
    public UUID getProjectBriefId() { return projectBriefId; }
    public void setProjectBriefId(UUID projectBriefId) { this.projectBriefId = projectBriefId; }
    public Integer getProjectBriefVersionNumber() { return projectBriefVersionNumber; }
    public void setProjectBriefVersionNumber(Integer projectBriefVersionNumber) { this.projectBriefVersionNumber = projectBriefVersionNumber; }
    public BdmApprovalStatus getStatus() { return status; }
    public void setStatus(BdmApprovalStatus status) { this.status = status; }
    public ProjectBriefStatus getProjectBriefStatus() { return projectBriefStatus; }
    public void setProjectBriefStatus(ProjectBriefStatus projectBriefStatus) { this.projectBriefStatus = projectBriefStatus; }
    public UUID getDecisionMakerId() { return decisionMakerId; }
    public void setDecisionMakerId(UUID decisionMakerId) { this.decisionMakerId = decisionMakerId; }
    public String getDecisionMakerName() { return decisionMakerName; }
    public void setDecisionMakerName(String decisionMakerName) { this.decisionMakerName = decisionMakerName; }
    public OffsetDateTime getDecisionDate() { return decisionDate; }
    public void setDecisionDate(OffsetDateTime decisionDate) { this.decisionDate = decisionDate; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public List<BdmApprovalCommentDTO> getComments() { return comments; }
    public void setComments(List<BdmApprovalCommentDTO> comments) { this.comments = comments; }
    public String getOpportunityNumber() { return opportunityNumber; }
    public void setOpportunityNumber(String opportunityNumber) { this.opportunityNumber = opportunityNumber; }
    public String getOpportunityTitle() { return opportunityTitle; }
    public void setOpportunityTitle(String opportunityTitle) { this.opportunityTitle = opportunityTitle; }
    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }
    public UUID getAssignedSalesOfficerId() { return assignedSalesOfficerId; }
    public void setAssignedSalesOfficerId(UUID assignedSalesOfficerId) { this.assignedSalesOfficerId = assignedSalesOfficerId; }
    public String getAssignedSalesOfficerName() { return assignedSalesOfficerName; }
    public void setAssignedSalesOfficerName(String assignedSalesOfficerName) { this.assignedSalesOfficerName = assignedSalesOfficerName; }
}
