package com.knoweb.salesmanagement.marketingroi.dto;

import com.knoweb.salesmanagement.marketingroi.enums.MarketingCampaignStatus;
import com.knoweb.salesmanagement.marketingroi.enums.MarketingPlatform;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class CampaignSummaryDto {
    private UUID campaignId;
    private String campaignName;
    private MarketingPlatform platform;
    private LocalDate startDate;
    private LocalDate endDate;
    private MarketingCampaignStatus status;
    private BigDecimal marketingCost;
    private long generatedLeads;
    private long qualifiedLeads;
    private long convertedClients;
    private BigDecimal attributedRevenue;
    private BigDecimal costPerLead;
    private BigDecimal costPerCustomer;
    private BigDecimal roiPercentage;

    public CampaignSummaryDto() {
    }

    public UUID getCampaignId() { return campaignId; }
    public void setCampaignId(UUID campaignId) { this.campaignId = campaignId; }
    
    public String getCampaignName() { return campaignName; }
    public void setCampaignName(String campaignName) { this.campaignName = campaignName; }
    
    public MarketingPlatform getPlatform() { return platform; }
    public void setPlatform(MarketingPlatform platform) { this.platform = platform; }
    
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    
    public MarketingCampaignStatus getStatus() { return status; }
    public void setStatus(MarketingCampaignStatus status) { this.status = status; }
    
    public BigDecimal getMarketingCost() { return marketingCost; }
    public void setMarketingCost(BigDecimal marketingCost) { this.marketingCost = marketingCost; }
    
    public long getGeneratedLeads() { return generatedLeads; }
    public void setGeneratedLeads(long generatedLeads) { this.generatedLeads = generatedLeads; }
    
    public long getQualifiedLeads() { return qualifiedLeads; }
    public void setQualifiedLeads(long qualifiedLeads) { this.qualifiedLeads = qualifiedLeads; }
    
    public long getConvertedClients() { return convertedClients; }
    public void setConvertedClients(long convertedClients) { this.convertedClients = convertedClients; }
    
    public BigDecimal getAttributedRevenue() { return attributedRevenue; }
    public void setAttributedRevenue(BigDecimal attributedRevenue) { this.attributedRevenue = attributedRevenue; }
    
    public BigDecimal getCostPerLead() { return costPerLead; }
    public void setCostPerLead(BigDecimal costPerLead) { this.costPerLead = costPerLead; }
    
    public BigDecimal getCostPerCustomer() { return costPerCustomer; }
    public void setCostPerCustomer(BigDecimal costPerCustomer) { this.costPerCustomer = costPerCustomer; }
    
    public BigDecimal getRoiPercentage() { return roiPercentage; }
    public void setRoiPercentage(BigDecimal roiPercentage) { this.roiPercentage = roiPercentage; }
}
