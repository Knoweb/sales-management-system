package com.knoweb.salesmanagement.lead.dto;

import com.knoweb.salesmanagement.lead.enums.FollowUpStatus;
import java.time.OffsetDateTime;
import java.util.UUID;

public class FollowUpDTO {
    private UUID id;
    private UUID leadId;
    private OffsetDateTime followUpDate;
    private FollowUpStatus status;
    private String notes;
    private UUID assignedTo;
    private String assignedToName;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getLeadId() { return leadId; }
    public void setLeadId(UUID leadId) { this.leadId = leadId; }
    public OffsetDateTime getFollowUpDate() { return followUpDate; }
    public void setFollowUpDate(OffsetDateTime followUpDate) { this.followUpDate = followUpDate; }
    public FollowUpStatus getStatus() { return status; }
    public void setStatus(FollowUpStatus status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public UUID getAssignedTo() { return assignedTo; }
    public void setAssignedTo(UUID assignedTo) { this.assignedTo = assignedTo; }
    public String getAssignedToName() { return assignedToName; }
    public void setAssignedToName(String assignedToName) { this.assignedToName = assignedToName; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
