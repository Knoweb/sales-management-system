package com.knoweb.salesmanagement.opportunity.dto;

import com.knoweb.salesmanagement.opportunity.enums.OpportunityStage;
import com.knoweb.salesmanagement.projectbrief.dto.ProjectBriefSummaryDTO;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public class SalesOpportunitySummaryDTO {
    private UUID id;
    private String opportunityNumber;
    private String title;
    private String clientName;
    private String productCategoryName;
    private String assignedSalesOfficerName;
    private BigDecimal estimatedValue;
    private String currency;
    private Integer probabilityPercent;
    private OpportunityStage stage;
    private ProjectBriefSummaryDTO projectBrief;
    private OffsetDateTime createdAt;
    private String sourceLeadTitle;
    
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getOpportunityNumber() { return opportunityNumber; }
    public void setOpportunityNumber(String opportunityNumber) { this.opportunityNumber = opportunityNumber; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }
    public String getProductCategoryName() { return productCategoryName; }
    public void setProductCategoryName(String productCategoryName) { this.productCategoryName = productCategoryName; }
    public String getAssignedSalesOfficerName() { return assignedSalesOfficerName; }
    public void setAssignedSalesOfficerName(String assignedSalesOfficerName) { this.assignedSalesOfficerName = assignedSalesOfficerName; }
    public BigDecimal getEstimatedValue() { return estimatedValue; }
    public void setEstimatedValue(BigDecimal estimatedValue) { this.estimatedValue = estimatedValue; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public Integer getProbabilityPercent() { return probabilityPercent; }
    public void setProbabilityPercent(Integer probabilityPercent) { this.probabilityPercent = probabilityPercent; }
    public OpportunityStage getStage() { return stage; }
    public void setStage(OpportunityStage stage) { this.stage = stage; }
    public ProjectBriefSummaryDTO getProjectBrief() { return projectBrief; }
    public void setProjectBrief(ProjectBriefSummaryDTO projectBrief) { this.projectBrief = projectBrief; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public String getSourceLeadTitle() { return sourceLeadTitle; }
    public void setSourceLeadTitle(String sourceLeadTitle) { this.sourceLeadTitle = sourceLeadTitle; }
}
