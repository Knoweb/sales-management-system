package com.knoweb.salesmanagement.virtualtour.dto;

import com.knoweb.salesmanagement.virtualtour.enums.VirtualTourStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.UUID;

public class VirtualTourRequestDTO {

    private UUID leadId;
    private UUID opportunityId;

    @NotBlank(message = "Platform is required")
    private String platform;

    @NotNull(message = "Tour date is required")
    private OffsetDateTime tourDate;
    
    private String notes;
    private VirtualTourStatus status;
    private UUID conductedBy;
    
    private String language;
    private String demonstratedProduct;
    private String clientResponse;
    private Integer probabilityBefore;
    private Integer probabilityAfter;
    private Boolean followUpRequired;

    // Getters and Setters
    public UUID getLeadId() { return leadId; }
    public void setLeadId(UUID leadId) { this.leadId = leadId; }

    public UUID getOpportunityId() { return opportunityId; }
    public void setOpportunityId(UUID opportunityId) { this.opportunityId = opportunityId; }

    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }

    public OffsetDateTime getTourDate() { return tourDate; }
    public void setTourDate(OffsetDateTime tourDate) { this.tourDate = tourDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public VirtualTourStatus getStatus() { return status; }
    public void setStatus(VirtualTourStatus status) { this.status = status; }

    public UUID getConductedBy() { return conductedBy; }
    public void setConductedBy(UUID conductedBy) { this.conductedBy = conductedBy; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getDemonstratedProduct() { return demonstratedProduct; }
    public void setDemonstratedProduct(String demonstratedProduct) { this.demonstratedProduct = demonstratedProduct; }

    public String getClientResponse() { return clientResponse; }
    public void setClientResponse(String clientResponse) { this.clientResponse = clientResponse; }

    public Integer getProbabilityBefore() { return probabilityBefore; }
    public void setProbabilityBefore(Integer probabilityBefore) { this.probabilityBefore = probabilityBefore; }

    public Integer getProbabilityAfter() { return probabilityAfter; }
    public void setProbabilityAfter(Integer probabilityAfter) { this.probabilityAfter = probabilityAfter; }

    public Boolean getFollowUpRequired() { return followUpRequired; }
    public void setFollowUpRequired(Boolean followUpRequired) { this.followUpRequired = followUpRequired; }
}
