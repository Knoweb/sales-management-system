package com.knoweb.salesmanagement.marketingroi.dto;

import java.math.BigDecimal;
import java.util.List;

public class MarketingRoiOverviewDto {
    private long totalCampaigns;
    private BigDecimal totalMarketingSpend;
    private long generatedLeads;
    private long qualifiedLeads;
    private long convertedClients;
    private BigDecimal attributedRevenue;
    private BigDecimal overallRoi;
    private List<PlatformComparisonDto> platformComparisons;

    public MarketingRoiOverviewDto() {
    }

    public long getTotalCampaigns() { return totalCampaigns; }
    public void setTotalCampaigns(long totalCampaigns) { this.totalCampaigns = totalCampaigns; }

    public BigDecimal getTotalMarketingSpend() { return totalMarketingSpend; }
    public void setTotalMarketingSpend(BigDecimal totalMarketingSpend) { this.totalMarketingSpend = totalMarketingSpend; }

    public long getGeneratedLeads() { return generatedLeads; }
    public void setGeneratedLeads(long generatedLeads) { this.generatedLeads = generatedLeads; }

    public long getQualifiedLeads() { return qualifiedLeads; }
    public void setQualifiedLeads(long qualifiedLeads) { this.qualifiedLeads = qualifiedLeads; }

    public long getConvertedClients() { return convertedClients; }
    public void setConvertedClients(long convertedClients) { this.convertedClients = convertedClients; }

    public BigDecimal getAttributedRevenue() { return attributedRevenue; }
    public void setAttributedRevenue(BigDecimal attributedRevenue) { this.attributedRevenue = attributedRevenue; }

    public BigDecimal getOverallRoi() { return overallRoi; }
    public void setOverallRoi(BigDecimal overallRoi) { this.overallRoi = overallRoi; }

    public List<PlatformComparisonDto> getPlatformComparisons() { return platformComparisons; }
    public void setPlatformComparisons(List<PlatformComparisonDto> platformComparisons) { this.platformComparisons = platformComparisons; }
}
