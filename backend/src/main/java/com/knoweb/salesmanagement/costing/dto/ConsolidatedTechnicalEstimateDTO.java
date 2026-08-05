package com.knoweb.salesmanagement.costing.dto;

import com.knoweb.salesmanagement.costing.enums.ConsolidatedEstimateStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class ConsolidatedTechnicalEstimateDTO {

    private UUID id;
    private UUID technicalProjectId;
    private String projectCode;
    private String projectTitle;
    private Integer versionNumber;
    private ConsolidatedEstimateStatus status;
    private BigDecimal totalMaterialsCost;
    private BigDecimal totalLabourCost;
    private BigDecimal totalMachinesEquipmentCost;
    private BigDecimal totalSoftwareCost;
    private BigDecimal totalTransportCost;
    private BigDecimal totalInstallationCost;
    private BigDecimal totalTestingCost;
    private BigDecimal totalSubcontractingCost;
    private BigDecimal totalMaintenanceCost;
    private BigDecimal totalContingencyCost;
    private BigDecimal totalTaxOtherCost;
    private BigDecimal subtotal;
    private BigDecimal contingencyAmount;
    private BigDecimal taxAmount;
    private BigDecimal marginAmount;
    private BigDecimal finalTotal;
    private Integer totalDesignDurationDays;
    private Integer totalProcurementDurationDays;
    private Integer totalDevelopmentDurationDays;
    private Integer totalTestingDurationDays;
    private Integer totalInstallationDurationDays;
    private Integer totalTrainingDurationDays;
    private Integer totalDeliveryDurationDays;
    private UUID approvedBy;
    private String approvedByName;
    private OffsetDateTime approvedAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private List<DepartmentEstimateDTO> departmentEstimates = new ArrayList<>();

    public ConsolidatedTechnicalEstimateDTO() {}

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

    public BigDecimal getTotalMaterialsCost() { return totalMaterialsCost; }
    public void setTotalMaterialsCost(BigDecimal totalMaterialsCost) { this.totalMaterialsCost = totalMaterialsCost; }

    public BigDecimal getTotalLabourCost() { return totalLabourCost; }
    public void setTotalLabourCost(BigDecimal totalLabourCost) { this.totalLabourCost = totalLabourCost; }

    public BigDecimal getTotalMachinesEquipmentCost() { return totalMachinesEquipmentCost; }
    public void setTotalMachinesEquipmentCost(BigDecimal totalMachinesEquipmentCost) { this.totalMachinesEquipmentCost = totalMachinesEquipmentCost; }

    public BigDecimal getTotalSoftwareCost() { return totalSoftwareCost; }
    public void setTotalSoftwareCost(BigDecimal totalSoftwareCost) { this.totalSoftwareCost = totalSoftwareCost; }

    public BigDecimal getTotalTransportCost() { return totalTransportCost; }
    public void setTotalTransportCost(BigDecimal totalTransportCost) { this.totalTransportCost = totalTransportCost; }

    public BigDecimal getTotalInstallationCost() { return totalInstallationCost; }
    public void setTotalInstallationCost(BigDecimal totalInstallationCost) { this.totalInstallationCost = totalInstallationCost; }

    public BigDecimal getTotalTestingCost() { return totalTestingCost; }
    public void setTotalTestingCost(BigDecimal totalTestingCost) { this.totalTestingCost = totalTestingCost; }

    public BigDecimal getTotalSubcontractingCost() { return totalSubcontractingCost; }
    public void setTotalSubcontractingCost(BigDecimal totalSubcontractingCost) { this.totalSubcontractingCost = totalSubcontractingCost; }

    public BigDecimal getTotalMaintenanceCost() { return totalMaintenanceCost; }
    public void setTotalMaintenanceCost(BigDecimal totalMaintenanceCost) { this.totalMaintenanceCost = totalMaintenanceCost; }

    public BigDecimal getTotalContingencyCost() { return totalContingencyCost; }
    public void setTotalContingencyCost(BigDecimal totalContingencyCost) { this.totalContingencyCost = totalContingencyCost; }

    public BigDecimal getTotalTaxOtherCost() { return totalTaxOtherCost; }
    public void setTotalTaxOtherCost(BigDecimal totalTaxOtherCost) { this.totalTaxOtherCost = totalTaxOtherCost; }

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

    public Integer getTotalDesignDurationDays() { return totalDesignDurationDays; }
    public void setTotalDesignDurationDays(Integer totalDesignDurationDays) { this.totalDesignDurationDays = totalDesignDurationDays; }

    public Integer getTotalProcurementDurationDays() { return totalProcurementDurationDays; }
    public void setTotalProcurementDurationDays(Integer totalProcurementDurationDays) { this.totalProcurementDurationDays = totalProcurementDurationDays; }

    public Integer getTotalDevelopmentDurationDays() { return totalDevelopmentDurationDays; }
    public void setTotalDevelopmentDurationDays(Integer totalDevelopmentDurationDays) { this.totalDevelopmentDurationDays = totalDevelopmentDurationDays; }

    public Integer getTotalTestingDurationDays() { return totalTestingDurationDays; }
    public void setTotalTestingDurationDays(Integer totalTestingDurationDays) { this.totalTestingDurationDays = totalTestingDurationDays; }

    public Integer getTotalInstallationDurationDays() { return totalInstallationDurationDays; }
    public void setTotalInstallationDurationDays(Integer totalInstallationDurationDays) { this.totalInstallationDurationDays = totalInstallationDurationDays; }

    public Integer getTotalTrainingDurationDays() { return totalTrainingDurationDays; }
    public void setTotalTrainingDurationDays(Integer totalTrainingDurationDays) { this.totalTrainingDurationDays = totalTrainingDurationDays; }

    public Integer getTotalDeliveryDurationDays() { return totalDeliveryDurationDays; }
    public void setTotalDeliveryDurationDays(Integer totalDeliveryDurationDays) { this.totalDeliveryDurationDays = totalDeliveryDurationDays; }

    public UUID getApprovedBy() { return approvedBy; }
    public void setApprovedBy(UUID approvedBy) { this.approvedBy = approvedBy; }

    public String getApprovedByName() { return approvedByName; }
    public void setApprovedByName(String approvedByName) { this.approvedByName = approvedByName; }

    public OffsetDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(OffsetDateTime approvedAt) { this.approvedAt = approvedAt; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<DepartmentEstimateDTO> getDepartmentEstimates() { return departmentEstimates; }
    public void setDepartmentEstimates(List<DepartmentEstimateDTO> departmentEstimates) { this.departmentEstimates = departmentEstimates; }
}
