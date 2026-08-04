package com.knoweb.salesmanagement.technicalproject.dto;

import com.knoweb.salesmanagement.technicalproject.enums.TechnicalProjectStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

public class TechnicalProjectSummaryDTO {
    private UUID id;
    private String projectCode;
    private TechnicalProjectStatus status;
    private UUID projectBriefId;
    private String projectTitle;
    private UUID clientId;
    private String clientName;
    private UUID salesOpportunityId;
    private String opportunityReference;
    private UUID technicalCoordinatorId;
    private String technicalCoordinatorName;
    private OffsetDateTime bdmApprovedDate;
    private OffsetDateTime routedAt;
    private OffsetDateTime createdAt;
    private long departmentCount;
    private long teamReadyDepartmentCount;
    private String suggestedDepartments;
    private String routedDepartments;

    public TechnicalProjectSummaryDTO() {}

    public TechnicalProjectSummaryDTO(UUID id, String projectCode, TechnicalProjectStatus status, UUID projectBriefId, String projectTitle, UUID clientId, String clientName, UUID salesOpportunityId, String opportunityReference, UUID technicalCoordinatorId, String technicalCoordinatorName, OffsetDateTime bdmApprovedDate, OffsetDateTime routedAt, OffsetDateTime createdAt, long departmentCount, long teamReadyDepartmentCount, String suggestedDepartments, String routedDepartments) {
        this.id = id;
        this.projectCode = projectCode;
        this.status = status;
        this.projectBriefId = projectBriefId;
        this.projectTitle = projectTitle;
        this.clientId = clientId;
        this.clientName = clientName;
        this.salesOpportunityId = salesOpportunityId;
        this.opportunityReference = opportunityReference;
        this.technicalCoordinatorId = technicalCoordinatorId;
        this.technicalCoordinatorName = technicalCoordinatorName;
        this.bdmApprovedDate = bdmApprovedDate;
        this.routedAt = routedAt;
        this.createdAt = createdAt;
        this.departmentCount = departmentCount;
        this.teamReadyDepartmentCount = teamReadyDepartmentCount;
        this.suggestedDepartments = suggestedDepartments;
        this.routedDepartments = routedDepartments;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getProjectCode() {
        return projectCode;
    }

    public void setProjectCode(String projectCode) {
        this.projectCode = projectCode;
    }

    public TechnicalProjectStatus getStatus() {
        return status;
    }

    public void setStatus(TechnicalProjectStatus status) {
        this.status = status;
    }

    public UUID getProjectBriefId() {
        return projectBriefId;
    }

    public void setProjectBriefId(UUID projectBriefId) {
        this.projectBriefId = projectBriefId;
    }

    public String getProjectTitle() {
        return projectTitle;
    }

    public void setProjectTitle(String projectTitle) {
        this.projectTitle = projectTitle;
    }

    public UUID getClientId() {
        return clientId;
    }

    public void setClientId(UUID clientId) {
        this.clientId = clientId;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public UUID getSalesOpportunityId() {
        return salesOpportunityId;
    }

    public void setSalesOpportunityId(UUID salesOpportunityId) {
        this.salesOpportunityId = salesOpportunityId;
    }

    public String getOpportunityReference() {
        return opportunityReference;
    }

    public void setOpportunityReference(String opportunityReference) {
        this.opportunityReference = opportunityReference;
    }

    public UUID getTechnicalCoordinatorId() {
        return technicalCoordinatorId;
    }

    public void setTechnicalCoordinatorId(UUID technicalCoordinatorId) {
        this.technicalCoordinatorId = technicalCoordinatorId;
    }

    public String getTechnicalCoordinatorName() {
        return technicalCoordinatorName;
    }

    public void setTechnicalCoordinatorName(String technicalCoordinatorName) {
        this.technicalCoordinatorName = technicalCoordinatorName;
    }

    public OffsetDateTime getBdmApprovedDate() {
        return bdmApprovedDate;
    }

    public void setBdmApprovedDate(OffsetDateTime bdmApprovedDate) {
        this.bdmApprovedDate = bdmApprovedDate;
    }

    public OffsetDateTime getRoutedAt() {
        return routedAt;
    }

    public void setRoutedAt(OffsetDateTime routedAt) {
        this.routedAt = routedAt;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public long getDepartmentCount() {
        return departmentCount;
    }

    public void setDepartmentCount(long departmentCount) {
        this.departmentCount = departmentCount;
    }

    public long getTeamReadyDepartmentCount() {
        return teamReadyDepartmentCount;
    }

    public void setTeamReadyDepartmentCount(long teamReadyDepartmentCount) {
        this.teamReadyDepartmentCount = teamReadyDepartmentCount;
    }

    public String getSuggestedDepartments() {
        return suggestedDepartments;
    }

    public void setSuggestedDepartments(String suggestedDepartments) {
        this.suggestedDepartments = suggestedDepartments;
    }

    public String getRoutedDepartments() {
        return routedDepartments;
    }

    public void setRoutedDepartments(String routedDepartments) {
        this.routedDepartments = routedDepartments;
    }
}
