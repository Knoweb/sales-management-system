package com.knoweb.salesmanagement.opportunity.dto;

import com.knoweb.salesmanagement.opportunity.enums.OpportunityStage;
import com.knoweb.salesmanagement.projectbrief.dto.ProjectBriefSummaryDTO;
import com.knoweb.salesmanagement.lead.dto.LeadDTO;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.List;

public class SalesOpportunityDTO {
    private UUID id;
    private String opportunityNumber;
    private UUID clientId;
    private String clientName;
    private UUID primaryContactId;
    private String primaryContactName;
    private LeadDTO sourceLead;
    private String title;
    private String description;
    private UUID productCategoryId;
    private String productCategoryName;
    private UUID assignedSalesOfficerId;
    private String assignedSalesOfficerName;
    private BigDecimal estimatedValue;
    private String currency;
    private Integer probabilityPercent;
    private LocalDate expectedCloseDate;
    private OpportunityStage stage;
    private String onHoldReason;
    private String lostReason;
    private ProjectBriefSummaryDTO projectBrief;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private List<OpportunityActivityDTO> activities;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getOpportunityNumber() { return opportunityNumber; }
    public void setOpportunityNumber(String opportunityNumber) { this.opportunityNumber = opportunityNumber; }
    public UUID getClientId() { return clientId; }
    public void setClientId(UUID clientId) { this.clientId = clientId; }
    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }
    public UUID getPrimaryContactId() { return primaryContactId; }
    public void setPrimaryContactId(UUID primaryContactId) { this.primaryContactId = primaryContactId; }
    public String getPrimaryContactName() { return primaryContactName; }
    public void setPrimaryContactName(String primaryContactName) { this.primaryContactName = primaryContactName; }
    public LeadDTO getSourceLead() { return sourceLead; }
    public void setSourceLead(LeadDTO sourceLead) { this.sourceLead = sourceLead; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public UUID getProductCategoryId() { return productCategoryId; }
    public void setProductCategoryId(UUID productCategoryId) { this.productCategoryId = productCategoryId; }
    public String getProductCategoryName() { return productCategoryName; }
    public void setProductCategoryName(String productCategoryName) { this.productCategoryName = productCategoryName; }
    public UUID getAssignedSalesOfficerId() { return assignedSalesOfficerId; }
    public void setAssignedSalesOfficerId(UUID assignedSalesOfficerId) { this.assignedSalesOfficerId = assignedSalesOfficerId; }
    public String getAssignedSalesOfficerName() { return assignedSalesOfficerName; }
    public void setAssignedSalesOfficerName(String assignedSalesOfficerName) { this.assignedSalesOfficerName = assignedSalesOfficerName; }
    public BigDecimal getEstimatedValue() { return estimatedValue; }
    public void setEstimatedValue(BigDecimal estimatedValue) { this.estimatedValue = estimatedValue; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public Integer getProbabilityPercent() { return probabilityPercent; }
    public void setProbabilityPercent(Integer probabilityPercent) { this.probabilityPercent = probabilityPercent; }
    public LocalDate getExpectedCloseDate() { return expectedCloseDate; }
    public void setExpectedCloseDate(LocalDate expectedCloseDate) { this.expectedCloseDate = expectedCloseDate; }
    public OpportunityStage getStage() { return stage; }
    public void setStage(OpportunityStage stage) { this.stage = stage; }
    public String getOnHoldReason() { return onHoldReason; }
    public void setOnHoldReason(String onHoldReason) { this.onHoldReason = onHoldReason; }
    public String getLostReason() { return lostReason; }
    public void setLostReason(String lostReason) { this.lostReason = lostReason; }
    public ProjectBriefSummaryDTO getProjectBrief() { return projectBrief; }
    public void setProjectBrief(ProjectBriefSummaryDTO projectBrief) { this.projectBrief = projectBrief; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<OpportunityActivityDTO> getActivities() { return activities; }
    public void setActivities(List<OpportunityActivityDTO> activities) { this.activities = activities; }
}
