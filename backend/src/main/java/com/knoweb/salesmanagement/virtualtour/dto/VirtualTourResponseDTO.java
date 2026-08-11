package com.knoweb.salesmanagement.virtualtour.dto;

import com.knoweb.salesmanagement.virtualtour.enums.VirtualTourStatus;
import java.time.OffsetDateTime;
import java.util.UUID;

public class VirtualTourResponseDTO {

    private UUID id;
    private UUID leadId;
    private UUID opportunityId;
    
    private String targetName;
    private String targetType;
    
    private String platform;
    private VirtualTourStatus status;
    private OffsetDateTime tourDate;
    private String notes;
    private UUID conductedById;
    private String conductedByName;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    
    private String language;
    private String demonstratedProduct;
    private String clientResponse;
    private Integer probabilityBefore;
    private Integer probabilityAfter;
    private Boolean followUpRequired;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getLeadId() { return leadId; }
    public void setLeadId(UUID leadId) { this.leadId = leadId; }

    public UUID getOpportunityId() { return opportunityId; }
    public void setOpportunityId(UUID opportunityId) { this.opportunityId = opportunityId; }

    public String getTargetName() { return targetName; }
    public void setTargetName(String targetName) { this.targetName = targetName; }

    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }

    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }

    public VirtualTourStatus getStatus() { return status; }
    public void setStatus(VirtualTourStatus status) { this.status = status; }

    public OffsetDateTime getTourDate() { return tourDate; }
    public void setTourDate(OffsetDateTime tourDate) { this.tourDate = tourDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public UUID getConductedById() { return conductedById; }
    public void setConductedById(UUID conductedById) { this.conductedById = conductedById; }

    public String getConductedByName() { return conductedByName; }
    public void setConductedByName(String conductedByName) { this.conductedByName = conductedByName; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

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
