package com.knoweb.salesmanagement.marketingroi.dto;

import com.knoweb.salesmanagement.marketingroi.enums.MarketingPlatform;

import java.math.BigDecimal;

public class PlatformComparisonDto {
    private MarketingPlatform platform;
    private long totalCampaigns;
    private BigDecimal totalMarketingCost;
    private long generatedLeads;
    private long qualifiedLeads;
    private long convertedClients;
    private BigDecimal attributedRevenue;
    private BigDecimal costPerLead;
    private BigDecimal costPerCustomer;
    private BigDecimal roiPercentage;

    public PlatformComparisonDto() {
    }

    public MarketingPlatform getPlatform() { return platform; }
    public void setPlatform(MarketingPlatform platform) { this.platform = platform; }
    
    public long getTotalCampaigns() { return totalCampaigns; }
    public void setTotalCampaigns(long totalCampaigns) { this.totalCampaigns = totalCampaigns; }
    
    public BigDecimal getTotalMarketingCost() { return totalMarketingCost; }
    public void setTotalMarketingCost(BigDecimal totalMarketingCost) { this.totalMarketingCost = totalMarketingCost; }
    
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
