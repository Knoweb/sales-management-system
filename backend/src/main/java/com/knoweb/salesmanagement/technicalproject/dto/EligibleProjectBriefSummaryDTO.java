package com.knoweb.salesmanagement.technicalproject.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class EligibleProjectBriefSummaryDTO {
    private UUID id;
    private String title;
    private UUID clientId;
    private String clientName;
    private UUID opportunityId;
    private String opportunityReference;
    private OffsetDateTime bdmApprovedDate;
    private String suggestedDepartments;

    public EligibleProjectBriefSummaryDTO() {}

    public EligibleProjectBriefSummaryDTO(UUID id, String title, UUID clientId, String clientName, UUID opportunityId, String opportunityReference, OffsetDateTime bdmApprovedDate, String suggestedDepartments) {
        this.id = id;
        this.title = title;
        this.clientId = clientId;
        this.clientName = clientName;
        this.opportunityId = opportunityId;
        this.opportunityReference = opportunityReference;
        this.bdmApprovedDate = bdmApprovedDate;
        this.suggestedDepartments = suggestedDepartments;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
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

    public UUID getOpportunityId() {
        return opportunityId;
    }

    public void setOpportunityId(UUID opportunityId) {
        this.opportunityId = opportunityId;
    }

    public String getOpportunityReference() {
        return opportunityReference;
    }

    public void setOpportunityReference(String opportunityReference) {
        this.opportunityReference = opportunityReference;
    }

    public OffsetDateTime getBdmApprovedDate() {
        return bdmApprovedDate;
    }

    public void setBdmApprovedDate(OffsetDateTime bdmApprovedDate) {
        this.bdmApprovedDate = bdmApprovedDate;
    }

    public String getSuggestedDepartments() {
        return suggestedDepartments;
    }

    public void setSuggestedDepartments(String suggestedDepartments) {
        this.suggestedDepartments = suggestedDepartments;
    }
}
