package com.knoweb.salesmanagement.opportunity.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class OpportunityActivityDTO {
    private UUID id;
    private UUID opportunityId;
    private String activityType;
    private OffsetDateTime activityDate;
    private String description;
    private String details;
    private UUID createdById;
    private String createdByName;
    private OffsetDateTime createdAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getOpportunityId() { return opportunityId; }
    public void setOpportunityId(UUID opportunityId) { this.opportunityId = opportunityId; }
    public String getActivityType() { return activityType; }
    public void setActivityType(String activityType) { this.activityType = activityType; }
    public OffsetDateTime getActivityDate() { return activityDate; }
    public void setActivityDate(OffsetDateTime activityDate) { this.activityDate = activityDate; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public UUID getCreatedById() { return createdById; }
    public void setCreatedById(UUID createdById) { this.createdById = createdById; }
    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
