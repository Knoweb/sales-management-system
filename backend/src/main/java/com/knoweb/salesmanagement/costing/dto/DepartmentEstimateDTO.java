package com.knoweb.salesmanagement.costing.dto;

import com.knoweb.salesmanagement.costing.enums.DepartmentEstimateStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class DepartmentEstimateDTO {

    private UUID id;
    private UUID technicalProjectId;
    private UUID departmentId;
    private String departmentName;
    private String departmentCode;
    private Integer versionNumber;
    private DepartmentEstimateStatus status;
    private BigDecimal subtotal;
    private BigDecimal contingencyPercentage;
    private BigDecimal contingencyAmount;
    private BigDecimal taxPercentage;
    private BigDecimal taxAmount;
    private BigDecimal marginPercentage;
    private BigDecimal marginAmount;
    private BigDecimal finalTotal;
    private Integer designDurationDays;
    private Integer procurementDurationDays;
    private Integer developmentDurationDays;
    private Integer testingDurationDays;
    private Integer installationDurationDays;
    private Integer trainingDurationDays;
    private Integer deliveryDurationDays;
    private UUID submittedBy;
    private String submittedByName;
    private OffsetDateTime submittedAt;
    private String revisionNotes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private List<DepartmentEstimateLineItemDTO> lineItems = new ArrayList<>();

    public DepartmentEstimateDTO() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getTechnicalProjectId() { return technicalProjectId; }
    public void setTechnicalProjectId(UUID technicalProjectId) { this.technicalProjectId = technicalProjectId; }

    public UUID getDepartmentId() { return departmentId; }
    public void setDepartmentId(UUID departmentId) { this.departmentId = departmentId; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getDepartmentCode() { return departmentCode; }
    public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }

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

    public UUID getSubmittedBy() { return submittedBy; }
    public void setSubmittedBy(UUID submittedBy) { this.submittedBy = submittedBy; }

    public String getSubmittedByName() { return submittedByName; }
    public void setSubmittedByName(String submittedByName) { this.submittedByName = submittedByName; }

    public OffsetDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(OffsetDateTime submittedAt) { this.submittedAt = submittedAt; }

    public String getRevisionNotes() { return revisionNotes; }
    public void setRevisionNotes(String revisionNotes) { this.revisionNotes = revisionNotes; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<DepartmentEstimateLineItemDTO> getLineItems() { return lineItems; }
    public void setLineItems(List<DepartmentEstimateLineItemDTO> lineItems) { this.lineItems = lineItems; }
}
