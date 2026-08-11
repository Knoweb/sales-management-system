package com.knoweb.salesmanagement.marketingroi.dto;

import com.knoweb.salesmanagement.marketingroi.enums.MarketingCampaignStatus;
import com.knoweb.salesmanagement.marketingroi.enums.MarketingPlatform;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CreateMarketingCampaignRequest {

    @NotBlank(message = "Campaign name is required")
    private String name;

    @NotNull(message = "Platform is required")
    private MarketingPlatform platform;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private LocalDate endDate;

    private String objective;

    @NotNull(message = "Marketing cost is required")
    @Min(value = 0, message = "Cost cannot be negative")
    private BigDecimal marketingCost;

    @NotNull(message = "Status is required")
    private MarketingCampaignStatus status;

    private String notes;

    // Getters and Setters

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
}
