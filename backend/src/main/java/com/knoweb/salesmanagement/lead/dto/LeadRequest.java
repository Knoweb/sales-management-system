package com.knoweb.salesmanagement.lead.dto;

import com.knoweb.salesmanagement.lead.enums.InquirySource;
import com.knoweb.salesmanagement.lead.enums.LeadStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public class LeadRequest {
    
    @NotNull(message = "Client ID is required")
    private UUID clientId;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    private String title;

    @NotNull(message = "Inquiry source is required")
    private InquirySource inquirySource;

    @Size(max = 255, message = "Interested product cannot exceed 255 characters")
    private String interestedProduct;

    private String initialRequest;

    @NotNull(message = "Status is required")
    private LeadStatus status;

    private String notes;

    // Getters and setters
    public UUID getClientId() { return clientId; }
    public void setClientId(UUID clientId) { this.clientId = clientId; }
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
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
