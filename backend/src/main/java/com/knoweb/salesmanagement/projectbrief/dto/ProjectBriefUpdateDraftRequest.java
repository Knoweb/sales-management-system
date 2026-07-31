package com.knoweb.salesmanagement.projectbrief.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class ProjectBriefUpdateDraftRequest {
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
    private List<UUID> requiredDepartmentIds;
    private Integer versionNumber;
    private String changeSummary;

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
    public List<UUID> getRequiredDepartmentIds() { return requiredDepartmentIds; }
    public void setRequiredDepartmentIds(List<UUID> requiredDepartmentIds) { this.requiredDepartmentIds = requiredDepartmentIds; }
    public Integer getVersionNumber() { return versionNumber; }
    public void setVersionNumber(Integer versionNumber) { this.versionNumber = versionNumber; }
    public String getChangeSummary() { return changeSummary; }
    public void setChangeSummary(String changeSummary) { this.changeSummary = changeSummary; }
}
