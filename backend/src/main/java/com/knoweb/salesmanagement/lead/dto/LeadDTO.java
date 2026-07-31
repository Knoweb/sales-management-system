package com.knoweb.salesmanagement.lead.dto;

import com.knoweb.salesmanagement.lead.enums.InquirySource;
import com.knoweb.salesmanagement.lead.enums.LeadStatus;
import java.time.OffsetDateTime;
import java.util.UUID;

public class LeadDTO {
    private UUID id;
    private UUID clientId;
    private String clientName;
    private UUID contactId;
    private String contactName;
    private String title;
    private InquirySource inquirySource;
    private String interestedProduct;
    private String initialRequest;
    private LeadStatus status;
    private UUID assignedTo;
    private String assignedToName;
    private String notes;
    private boolean active;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private OffsetDateTime initialMeetingAt;
    
    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getClientId() { return clientId; }
    public void setClientId(UUID clientId) { this.clientId = clientId; }
    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }
    public UUID getContactId() { return contactId; }
    public void setContactId(UUID contactId) { this.contactId = contactId; }
    public String getContactName() { return contactName; }
    public void setContactName(String contactName) { this.contactName = contactName; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public InquirySource getInquirySource() { return inquirySource; }
    public void setInquirySource(InquirySource inquirySource) { this.inquirySource = inquirySource; }
    public String getInterestedProduct() { return interestedProduct; }
    public void setInterestedProduct(String interestedProduct) { this.interestedProduct = interestedProduct; }
    public String getInitialRequest() { return initialRequest; }
    public void setInitialRequest(String initialRequest) { this.initialRequest = initialRequest; }
    public LeadStatus getStatus() { return status; }
    public void setStatus(LeadStatus status) { this.status = status; }
    public UUID getAssignedTo() { return assignedTo; }
    public void setAssignedTo(UUID assignedTo) { this.assignedTo = assignedTo; }
    public String getAssignedToName() { return assignedToName; }
    public void setAssignedToName(String assignedToName) { this.assignedToName = assignedToName; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
    public OffsetDateTime getInitialMeetingAt() { return initialMeetingAt; }
    public void setInitialMeetingAt(OffsetDateTime initialMeetingAt) { this.initialMeetingAt = initialMeetingAt; }
}
