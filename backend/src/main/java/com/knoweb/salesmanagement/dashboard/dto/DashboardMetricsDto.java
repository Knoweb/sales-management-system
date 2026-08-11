package com.knoweb.salesmanagement.dashboard.dto;

import java.math.BigDecimal;

public class DashboardMetricsDto {
    private long totalLeads;
    private long activeOpportunities;
    private long pendingQuotations;
    private long activeTechnicalProjects;
    private BigDecimal totalExpectedRevenue;
    private BigDecimal totalConfirmedRevenue;
    private java.util.Map<String, Long> quotationBreakdown;

    public long getTotalLeads() {
        return totalLeads;
    }

    public void setTotalLeads(long totalLeads) {
        this.totalLeads = totalLeads;
    }

    public long getActiveOpportunities() {
        return activeOpportunities;
    }

    public void setActiveOpportunities(long activeOpportunities) {
        this.activeOpportunities = activeOpportunities;
    }

    public long getPendingQuotations() {
        return pendingQuotations;
    }

    public void setPendingQuotations(long pendingQuotations) {
        this.pendingQuotations = pendingQuotations;
    }

    public long getActiveTechnicalProjects() {
        return activeTechnicalProjects;
    }

    public void setActiveTechnicalProjects(long activeTechnicalProjects) {
        this.activeTechnicalProjects = activeTechnicalProjects;
    }

    public BigDecimal getTotalExpectedRevenue() {
        return totalExpectedRevenue;
    }

    public void setTotalExpectedRevenue(BigDecimal totalExpectedRevenue) {
        this.totalExpectedRevenue = totalExpectedRevenue;
    }

    public BigDecimal getTotalConfirmedRevenue() {
        return totalConfirmedRevenue;
    }

    public void setTotalConfirmedRevenue(BigDecimal totalConfirmedRevenue) {
        this.totalConfirmedRevenue = totalConfirmedRevenue;
    }
    
    public java.util.Map<String, Long> getQuotationBreakdown() {
        return quotationBreakdown;
    }
    
    public void setQuotationBreakdown(java.util.Map<String, Long> quotationBreakdown) {
        this.quotationBreakdown = quotationBreakdown;
    }
}
