package com.knoweb.salesmanagement.costing.entity;

import com.knoweb.salesmanagement.department.entity.Department;
import com.knoweb.salesmanagement.technicalproject.entity.TechnicalProject;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.costing.enums.DepartmentEstimateStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "department_technical_estimates", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"technical_project_id", "department_id", "version_number"})
})
public class DepartmentTechnicalEstimate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technical_project_id", nullable = false)
    private TechnicalProject technicalProject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private DepartmentEstimateStatus status = DepartmentEstimateStatus.DRAFT;

    @Column(name = "subtotal", nullable = false, precision = 19, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "contingency_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal contingencyPercentage = BigDecimal.ZERO;

    @Column(name = "contingency_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal contingencyAmount = BigDecimal.ZERO;

    @Column(name = "tax_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal taxPercentage = BigDecimal.ZERO;

    @Column(name = "tax_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "margin_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal marginPercentage = BigDecimal.ZERO;

    @Column(name = "margin_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal marginAmount = BigDecimal.ZERO;

    @Column(name = "final_total", nullable = false, precision = 19, scale = 2)
    private BigDecimal finalTotal = BigDecimal.ZERO;

    @Column(name = "design_duration_days", nullable = false)
    private Integer designDurationDays = 0;

    @Column(name = "procurement_duration_days", nullable = false)
    private Integer procurementDurationDays = 0;

    @Column(name = "development_duration_days", nullable = false)
    private Integer developmentDurationDays = 0;

    @Column(name = "testing_duration_days", nullable = false)
    private Integer testingDurationDays = 0;

    @Column(name = "installation_duration_days", nullable = false)
    private Integer installationDurationDays = 0;

    @Column(name = "training_duration_days", nullable = false)
    private Integer trainingDurationDays = 0;

    @Column(name = "delivery_duration_days", nullable = false)
    private Integer deliveryDurationDays = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by")
    private User submittedBy;

    @Column(name = "submitted_at")
    private OffsetDateTime submittedAt;

    @Column(name = "revision_notes", columnDefinition = "TEXT")
    private String revisionNotes;

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

    @OneToMany(mappedBy = "departmentEstimate", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DepartmentEstimateLineItem> lineItems = new ArrayList<>();

    public DepartmentTechnicalEstimate() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public TechnicalProject getTechnicalProject() { return technicalProject; }
    public void setTechnicalProject(TechnicalProject technicalProject) { this.technicalProject = technicalProject; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }

    public Integer getVersionNumber() { return versionNumber; }
    public void setVersionNumber(Integer versionNumber) { this.versionNumber = versionNumber; }

    public DepartmentEstimateStatus getStatus() { return status; }
    public void setStatus(DepartmentEstimateStatus status) { this.status = status; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getContingencyPercentage() { return contingencyPercentage; }
    public void setContingencyPercentage(BigDecimal contingencyPercentage) { this.contingencyPercentage = contingencyPercentage; }

    public BigDecimal getContingencyAmount() { return contingencyAmount; }
    public void setContingencyAmount(BigDecimal contingencyAmount) { this.contingencyAmount = contingencyAmount; }

    public BigDecimal getTaxPercentage() { return taxPercentage; }
    public void setTaxPercentage(BigDecimal taxPercentage) { this.taxPercentage = taxPercentage; }

    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }

    public BigDecimal getMarginPercentage() { return marginPercentage; }
    public void setMarginPercentage(BigDecimal marginPercentage) { this.marginPercentage = marginPercentage; }

    public BigDecimal getMarginAmount() { return marginAmount; }
    public void setMarginAmount(BigDecimal marginAmount) { this.marginAmount = marginAmount; }

    public BigDecimal getFinalTotal() { return finalTotal; }
    public void setFinalTotal(BigDecimal finalTotal) { this.finalTotal = finalTotal; }

    public Integer getDesignDurationDays() { return designDurationDays; }
    public void setDesignDurationDays(Integer designDurationDays) { this.designDurationDays = designDurationDays; }

    public Integer getProcurementDurationDays() { return procurementDurationDays; }
    public void setProcurementDurationDays(Integer procurementDurationDays) { this.procurementDurationDays = procurementDurationDays; }

    public Integer getDevelopmentDurationDays() { return developmentDurationDays; }
    public void setDevelopmentDurationDays(Integer developmentDurationDays) { this.developmentDurationDays = developmentDurationDays; }

    public Integer getTestingDurationDays() { return testingDurationDays; }
    public void setTestingDurationDays(Integer testingDurationDays) { this.testingDurationDays = testingDurationDays; }

    public Integer getInstallationDurationDays() { return installationDurationDays; }
    public void setInstallationDurationDays(Integer installationDurationDays) { this.installationDurationDays = installationDurationDays; }

    public Integer getTrainingDurationDays() { return trainingDurationDays; }
    public void setTrainingDurationDays(Integer trainingDurationDays) { this.trainingDurationDays = trainingDurationDays; }

    public Integer getDeliveryDurationDays() { return deliveryDurationDays; }
    public void setDeliveryDurationDays(Integer deliveryDurationDays) { this.deliveryDurationDays = deliveryDurationDays; }

    public User getSubmittedBy() { return submittedBy; }
    public void setSubmittedBy(User submittedBy) { this.submittedBy = submittedBy; }

    public OffsetDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(OffsetDateTime submittedAt) { this.submittedAt = submittedAt; }

    public String getRevisionNotes() { return revisionNotes; }
    public void setRevisionNotes(String revisionNotes) { this.revisionNotes = revisionNotes; }

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }

    public List<DepartmentEstimateLineItem> getLineItems() { return lineItems; }
    public void setLineItems(List<DepartmentEstimateLineItem> lineItems) { this.lineItems = lineItems; }

    public void addLineItem(DepartmentEstimateLineItem item) {
        lineItems.add(item);
        item.setDepartmentEstimate(this);
    }

    public void removeLineItem(DepartmentEstimateLineItem item) {
        lineItems.remove(item);
        item.setDepartmentEstimate(null);
    }
}
