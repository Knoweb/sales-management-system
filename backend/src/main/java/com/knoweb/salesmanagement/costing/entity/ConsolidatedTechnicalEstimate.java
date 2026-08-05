package com.knoweb.salesmanagement.costing.entity;

import com.knoweb.salesmanagement.technicalproject.entity.TechnicalProject;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.costing.enums.ConsolidatedEstimateStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "consolidated_technical_estimates", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"technical_project_id", "version_number"})
})
public class ConsolidatedTechnicalEstimate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technical_project_id", nullable = false)
    private TechnicalProject technicalProject;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private ConsolidatedEstimateStatus status = ConsolidatedEstimateStatus.DRAFT;

    @Column(name = "total_materials_cost", nullable = false, precision = 19, scale = 2)
    private BigDecimal totalMaterialsCost = BigDecimal.ZERO;

    @Column(name = "total_labour_cost", nullable = false, precision = 19, scale = 2)
    private BigDecimal totalLabourCost = BigDecimal.ZERO;

    @Column(name = "total_machines_equipment_cost", nullable = false, precision = 19, scale = 2)
    private BigDecimal totalMachinesEquipmentCost = BigDecimal.ZERO;

    @Column(name = "total_software_cost", nullable = false, precision = 19, scale = 2)
    private BigDecimal totalSoftwareCost = BigDecimal.ZERO;

    @Column(name = "total_transport_cost", nullable = false, precision = 19, scale = 2)
    private BigDecimal totalTransportCost = BigDecimal.ZERO;

    @Column(name = "total_installation_cost", nullable = false, precision = 19, scale = 2)
    private BigDecimal totalInstallationCost = BigDecimal.ZERO;

    @Column(name = "total_testing_cost", nullable = false, precision = 19, scale = 2)
    private BigDecimal totalTestingCost = BigDecimal.ZERO;

    @Column(name = "total_subcontracting_cost", nullable = false, precision = 19, scale = 2)
    private BigDecimal totalSubcontractingCost = BigDecimal.ZERO;

    @Column(name = "total_maintenance_cost", nullable = false, precision = 19, scale = 2)
    private BigDecimal totalMaintenanceCost = BigDecimal.ZERO;

    @Column(name = "total_contingency_cost", nullable = false, precision = 19, scale = 2)
    private BigDecimal totalContingencyCost = BigDecimal.ZERO;

    @Column(name = "total_tax_other_cost", nullable = false, precision = 19, scale = 2)
    private BigDecimal totalTaxOtherCost = BigDecimal.ZERO;

    @Column(name = "subtotal", nullable = false, precision = 19, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "contingency_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal contingencyAmount = BigDecimal.ZERO;

    @Column(name = "tax_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "margin_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal marginAmount = BigDecimal.ZERO;

    @Column(name = "final_total", nullable = false, precision = 19, scale = 2)
    private BigDecimal finalTotal = BigDecimal.ZERO;

    @Column(name = "total_design_duration_days", nullable = false)
    private Integer totalDesignDurationDays = 0;

    @Column(name = "total_procurement_duration_days", nullable = false)
    private Integer totalProcurementDurationDays = 0;

    @Column(name = "total_development_duration_days", nullable = false)
    private Integer totalDevelopmentDurationDays = 0;

    @Column(name = "total_testing_duration_days", nullable = false)
    private Integer totalTestingDurationDays = 0;

    @Column(name = "total_installation_duration_days", nullable = false)
    private Integer totalInstallationDurationDays = 0;

    @Column(name = "total_training_duration_days", nullable = false)
    private Integer totalTrainingDurationDays = 0;

    @Column(name = "total_delivery_duration_days", nullable = false)
    private Integer totalDeliveryDurationDays = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(name = "approved_at")
    private OffsetDateTime approvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private Integer version = 0;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "consolidated_estimate_department_estimates",
        joinColumns = @JoinColumn(name = "consolidated_estimate_id"),
        inverseJoinColumns = @JoinColumn(name = "department_estimate_id")
    )
    private List<DepartmentTechnicalEstimate> departmentEstimates = new ArrayList<>();

    public ConsolidatedTechnicalEstimate() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public TechnicalProject getTechnicalProject() { return technicalProject; }
    public void setTechnicalProject(TechnicalProject technicalProject) { this.technicalProject = technicalProject; }

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

    public User getApprovedBy() { return approvedBy; }
    public void setApprovedBy(User approvedBy) { this.approvedBy = approvedBy; }

    public OffsetDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(OffsetDateTime approvedAt) { this.approvedAt = approvedAt; }

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }

    public List<DepartmentTechnicalEstimate> getDepartmentEstimates() { return departmentEstimates; }
    public void setDepartmentEstimates(List<DepartmentTechnicalEstimate> departmentEstimates) { this.departmentEstimates = departmentEstimates; }
}
