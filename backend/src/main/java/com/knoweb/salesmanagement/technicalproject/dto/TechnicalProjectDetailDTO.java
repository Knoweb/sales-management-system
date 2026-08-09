package com.knoweb.salesmanagement.technicalproject.dto;

import com.knoweb.salesmanagement.projectbrief.enums.ProjectBriefStatus;
import com.knoweb.salesmanagement.technicalproject.enums.TechnicalProjectStatus;
import com.knoweb.salesmanagement.opportunity.enums.OpportunityStage;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class TechnicalProjectDetailDTO {
    
    // Technical Project Info
    private UUID id;
    private String projectCode;
    private TechnicalProjectStatus status;
    private UUID technicalCoordinatorId;
    private String technicalCoordinatorName;
    private OffsetDateTime createdAt;
    private OffsetDateTime routedAt;
    private Integer version;

    // Client Info
    private UUID clientId;
    private String clientName;
    private String primaryContactSummary;

    // Sales Opportunity Info
    private UUID salesOpportunityId;
    private String opportunityReference;
    private String opportunityTitle;
    private OpportunityStage opportunityStage;

    // Project Brief Info
    private UUID projectBriefId;
    private Integer currentVersionNumber;
    private String projectTitle;
    private String projectScope;
    private String technicalRequirements;
    private BigDecimal expectedBudget;
    private String currency;
    private LocalDate expectedDeadline;
    private String siteDetails;
    private String suggestedDepartments;
    private ProjectBriefStatus projectBriefStatus;

    // Approvals
    private Phase6ApprovalSummaryDTO approvalSummary;

    // Routing
    private List<TechnicalProjectDepartmentDTO> routedDepartments;

    public TechnicalProjectDetailDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public String getProjectCode() { return projectCode; }
    public void setProjectCode(String projectCode) { this.projectCode = projectCode; }
    
    public TechnicalProjectStatus getStatus() { return status; }
    public void setStatus(TechnicalProjectStatus status) { this.status = status; }
    
    public UUID getTechnicalCoordinatorId() { return technicalCoordinatorId; }
    public void setTechnicalCoordinatorId(UUID technicalCoordinatorId) { this.technicalCoordinatorId = technicalCoordinatorId; }
    
    public String getTechnicalCoordinatorName() { return technicalCoordinatorName; }
    public void setTechnicalCoordinatorName(String technicalCoordinatorName) { this.technicalCoordinatorName = technicalCoordinatorName; }
    
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    
    public OffsetDateTime getRoutedAt() { return routedAt; }
    public void setRoutedAt(OffsetDateTime routedAt) { this.routedAt = routedAt; }
    
    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }

    public UUID getClientId() { return clientId; }
    public void setClientId(UUID clientId) { this.clientId = clientId; }
    
    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }
    
    public String getPrimaryContactSummary() { return primaryContactSummary; }
    public void setPrimaryContactSummary(String primaryContactSummary) { this.primaryContactSummary = primaryContactSummary; }

    public UUID getSalesOpportunityId() { return salesOpportunityId; }
    public void setSalesOpportunityId(UUID salesOpportunityId) { this.salesOpportunityId = salesOpportunityId; }
    
    public String getOpportunityReference() { return opportunityReference; }
    public void setOpportunityReference(String opportunityReference) { this.opportunityReference = opportunityReference; }
    
    public String getOpportunityTitle() { return opportunityTitle; }
    public void setOpportunityTitle(String opportunityTitle) { this.opportunityTitle = opportunityTitle; }
    
    public OpportunityStage getOpportunityStage() { return opportunityStage; }
    public void setOpportunityStage(OpportunityStage opportunityStage) { this.opportunityStage = opportunityStage; }

    public UUID getProjectBriefId() { return projectBriefId; }
    public void setProjectBriefId(UUID projectBriefId) { this.projectBriefId = projectBriefId; }
    
    public Integer getCurrentVersionNumber() { return currentVersionNumber; }
    public void setCurrentVersionNumber(Integer currentVersionNumber) { this.currentVersionNumber = currentVersionNumber; }
    
    public String getProjectTitle() { return projectTitle; }
    public void setProjectTitle(String projectTitle) { this.projectTitle = projectTitle; }
    
    public String getProjectScope() { return projectScope; }
    public void setProjectScope(String projectScope) { this.projectScope = projectScope; }
    
    public String getTechnicalRequirements() { return technicalRequirements; }
    public void setTechnicalRequirements(String technicalRequirements) { this.technicalRequirements = technicalRequirements; }
    
    public BigDecimal getExpectedBudget() { return expectedBudget; }
    public void setExpectedBudget(BigDecimal expectedBudget) { this.expectedBudget = expectedBudget; }
    
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    
    public LocalDate getExpectedDeadline() { return expectedDeadline; }
    public void setExpectedDeadline(LocalDate expectedDeadline) { this.expectedDeadline = expectedDeadline; }
    
    public String getSiteDetails() { return siteDetails; }
    public void setSiteDetails(String siteDetails) { this.siteDetails = siteDetails; }
    
    public String getSuggestedDepartments() { return suggestedDepartments; }
    public void setSuggestedDepartments(String suggestedDepartments) { this.suggestedDepartments = suggestedDepartments; }

    public ProjectBriefStatus getProjectBriefStatus() { return projectBriefStatus; }
    public void setProjectBriefStatus(ProjectBriefStatus projectBriefStatus) { this.projectBriefStatus = projectBriefStatus; }

    public Phase6ApprovalSummaryDTO getApprovalSummary() { return approvalSummary; }
    public void setApprovalSummary(Phase6ApprovalSummaryDTO approvalSummary) { this.approvalSummary = approvalSummary; }

    public List<TechnicalProjectDepartmentDTO> getRoutedDepartments() { return routedDepartments; }
    public void setRoutedDepartments(List<TechnicalProjectDepartmentDTO> routedDepartments) { this.routedDepartments = routedDepartments; }

    private String businessProblem;
    private String requiredSolution;
    private List<String> suggestedDepartmentIds;

    public String getBusinessProblem() { return businessProblem; }
    public void setBusinessProblem(String businessProblem) { this.businessProblem = businessProblem; }

    public String getRequiredSolution() { return requiredSolution; }
    public void setRequiredSolution(String requiredSolution) { this.requiredSolution = requiredSolution; }

    public List<String> getSuggestedDepartmentIds() { return suggestedDepartmentIds; }
    public void setSuggestedDepartmentIds(List<String> suggestedDepartmentIds) { this.suggestedDepartmentIds = suggestedDepartmentIds; }
}
