package com.knoweb.salesmanagement.lead.dto;

import com.knoweb.salesmanagement.lead.enums.FollowUpStatus;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.UUID;

public class FollowUpRequest {
    
    @NotNull(message = "Follow up date is required")
    private OffsetDateTime followUpDate;

    @NotNull(message = "Status is required")
    private FollowUpStatus status;

    private String notes;
    private UUID assignedTo;

    // Getters and setters
    public OffsetDateTime getFollowUpDate() { return followUpDate; }
    public void setFollowUpDate(OffsetDateTime followUpDate) { this.followUpDate = followUpDate; }
    public FollowUpStatus getStatus() { return status; }
    public void setStatus(FollowUpStatus status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public UUID getAssignedTo() { return assignedTo; }
    public void setAssignedTo(UUID assignedTo) { this.assignedTo = assignedTo; }
}
