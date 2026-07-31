package com.knoweb.salesmanagement.projectbrief.dto;

import com.knoweb.salesmanagement.projectbrief.enums.ProjectBriefStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class ProjectBriefDTO {
    private UUID id;
    private UUID opportunityId;
    private ProjectBriefStatus status;
    private Integer currentVersionNumber;
    private String projectTitle;
    private String businessProblem;
    private String requiredSolution;
    private String projectScope;
    private String technicalRequirements;
    private BigDecimal expectedBudget;
    private String currency;
    private LocalDate expectedDeadline;
    private String siteName;
    private String siteAddress;
    private String siteInformation;
    private String meetingNotes;
    private String specialConditions;
    
    private List<DepartmentSummaryDTO> requiredDepartments;
    
    private OffsetDateTime dueAt;
    private boolean overdue;
    private Long overdueHours;
    private String deadlineStatus;
    
    private OffsetDateTime submittedAt;
    private UUID submittedById;
    private String submittedByName;
    
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getOpportunityId() { return opportunityId; }
    public void setOpportunityId(UUID opportunityId) { this.opportunityId = opportunityId; }
    public ProjectBriefStatus getStatus() { return status; }
    public void setStatus(ProjectBriefStatus status) { this.status = status; }
    public Integer getCurrentVersionNumber() { return currentVersionNumber; }
    public void setCurrentVersionNumber(Integer currentVersionNumber) { this.currentVersionNumber = currentVersionNumber; }
    public String getProjectTitle() { return projectTitle; }
    public void setProjectTitle(String projectTitle) { this.projectTitle = projectTitle; }
    public String getBusinessProblem() { return businessProblem; }
    public void setBusinessProblem(String businessProblem) { this.businessProblem = businessProblem; }
    public String getRequiredSolution() { return requiredSolution; }
    public void setRequiredSolution(String requiredSolution) { this.requiredSolution = requiredSolution; }
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
    public String getSiteName() { return siteName; }
    public void setSiteName(String siteName) { this.siteName = siteName; }
    public String getSiteAddress() { return siteAddress; }
    public void setSiteAddress(String siteAddress) { this.siteAddress = siteAddress; }
    public String getSiteInformation() { return siteInformation; }
    public void setSiteInformation(String siteInformation) { this.siteInformation = siteInformation; }
    public String getMeetingNotes() { return meetingNotes; }
    public void setMeetingNotes(String meetingNotes) { this.meetingNotes = meetingNotes; }
    public String getSpecialConditions() { return specialConditions; }
    public void setSpecialConditions(String specialConditions) { this.specialConditions = specialConditions; }
    public List<DepartmentSummaryDTO> getRequiredDepartments() { return requiredDepartments; }
    public void setRequiredDepartments(List<DepartmentSummaryDTO> requiredDepartments) { this.requiredDepartments = requiredDepartments; }
    public OffsetDateTime getDueAt() { return dueAt; }
    public void setDueAt(OffsetDateTime dueAt) { this.dueAt = dueAt; }
    public boolean isOverdue() { return overdue; }
    public void setOverdue(boolean overdue) { this.overdue = overdue; }
    public String getDeadlineStatus() { return deadlineStatus; }
    public void setDeadlineStatus(String deadlineStatus) { this.deadlineStatus = deadlineStatus; }
    public OffsetDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(OffsetDateTime submittedAt) { this.submittedAt = submittedAt; }
    public UUID getSubmittedById() { return submittedById; }
    public void setSubmittedById(UUID submittedById) { this.submittedById = submittedById; }
    public String getSubmittedByName() { return submittedByName; }
    public void setSubmittedByName(String submittedByName) { this.submittedByName = submittedByName; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public Long getOverdueHours() { return overdueHours; }
    public void setOverdueHours(Long overdueHours) { this.overdueHours = overdueHours; }
}
