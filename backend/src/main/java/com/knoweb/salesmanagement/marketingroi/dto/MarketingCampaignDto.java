package com.knoweb.salesmanagement.marketingroi.dto;

import com.knoweb.salesmanagement.marketingroi.enums.MarketingCampaignStatus;
import com.knoweb.salesmanagement.marketingroi.enums.MarketingPlatform;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public class MarketingCampaignDto {
    private UUID id;
    private String name;
    private MarketingPlatform platform;
    private LocalDate startDate;
    private LocalDate endDate;
    private String objective;
    private BigDecimal marketingCost;
    private MarketingCampaignStatus status;
    private String notes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    
    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public MarketingPlatform getPlatform() { return platform; }
    public void setPlatform(MarketingPlatform platform) { this.platform = platform; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getObjective() { return objective; }
    public void setObjective(String objective) { this.objective = objective; }
    public BigDecimal getMarketingCost() { return marketingCost; }
    public void setMarketingCost(BigDecimal marketingCost) { this.marketingCost = marketingCost; }
    public MarketingCampaignStatus getStatus() { return status; }
    public void setStatus(MarketingCampaignStatus status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
