package com.knoweb.salesmanagement.lead.dto;

import com.knoweb.salesmanagement.lead.enums.ActivityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;

public class LeadActivityRequest {
    
    @NotNull(message = "Activity type is required")
    private ActivityType activityType;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Activity date is required")
    private OffsetDateTime activityDate;

    // Getters and setters
    public ActivityType getActivityType() { return activityType; }
    public void setActivityType(ActivityType activityType) { this.activityType = activityType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public OffsetDateTime getActivityDate() { return activityDate; }
    public void setActivityDate(OffsetDateTime activityDate) { this.activityDate = activityDate; }
}
