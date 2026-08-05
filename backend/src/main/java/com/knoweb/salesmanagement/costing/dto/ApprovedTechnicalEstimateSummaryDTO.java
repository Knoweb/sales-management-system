package com.knoweb.salesmanagement.costing.dto;

import com.knoweb.salesmanagement.costing.enums.ConsolidatedEstimateStatus;
import com.knoweb.salesmanagement.costing.enums.EstimateLineItemCategory;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class ApprovedTechnicalEstimateSummaryDTO {

    private UUID id;
    private UUID technicalProjectId;
    private String projectCode;
    private String projectTitle;
    private Integer versionNumber;
    private ConsolidatedEstimateStatus status;
    private BigDecimal subtotal;
    private BigDecimal contingencyAmount;
    private BigDecimal taxAmount;
    private BigDecimal marginAmount;
    private BigDecimal finalTotal;
    private Integer totalDurationDays;
    private OffsetDateTime approvedAt;
    private String approvedByName;
    private Map<EstimateLineItemCategory, BigDecimal> categoryBreakdown = new HashMap<>();

    public ApprovedTechnicalEstimateSummaryDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getTechnicalProjectId() { return technicalProjectId; }
    public void setTechnicalProjectId(UUID technicalProjectId) { this.technicalProjectId = technicalProjectId; }

    public String getProjectCode() { return projectCode; }
    public void setProjectCode(String projectCode) { this.projectCode = projectCode; }

    public String getProjectTitle() { return projectTitle; }
    public void setProjectTitle(String projectTitle) { this.projectTitle = projectTitle; }

    public Integer getVersionNumber() { return versionNumber; }
    public void setVersionNumber(Integer versionNumber) { this.versionNumber = versionNumber; }

    public ConsolidatedEstimateStatus getStatus() { return status; }
    public void setStatus(ConsolidatedEstimateStatus status) { this.status = status; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getContingencyAmount() { return contingencyAmount; }
    public void setContingencyAmount(BigDecimal contingencyAmount) { this.contingencyAmount = contingencyAmount; }

    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }

    public BigDecimal getMarginAmount() { return marginAmount; }
    public void setMarginAmount(BigDecimal marginAmount) { this.marginAmount = marginAmount; }

    public BigDecimal getFinalTotal() { return finalTotal; }
    public void setFinalTotal(BigDecimal finalTotal) { this.finalTotal = finalTotal; }

    public Integer getTotalDurationDays() { return totalDurationDays; }
    public void setTotalDurationDays(Integer totalDurationDays) { this.totalDurationDays = totalDurationDays; }

    public OffsetDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(OffsetDateTime approvedAt) { this.approvedAt = approvedAt; }

    public String getApprovedByName() { return approvedByName; }
    public void setApprovedByName(String approvedByName) { this.approvedByName = approvedByName; }

    public Map<EstimateLineItemCategory, BigDecimal> getCategoryBreakdown() { return categoryBreakdown; }
    public void setCategoryBreakdown(Map<EstimateLineItemCategory, BigDecimal> categoryBreakdown) { this.categoryBreakdown = categoryBreakdown; }
}
