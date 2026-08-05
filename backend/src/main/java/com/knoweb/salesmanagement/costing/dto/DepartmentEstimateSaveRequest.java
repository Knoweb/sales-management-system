package com.knoweb.salesmanagement.costing.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class DepartmentEstimateSaveRequest {

    private BigDecimal contingencyPercentage = BigDecimal.ZERO;
    private BigDecimal contingencyAmount;
    private BigDecimal taxPercentage = BigDecimal.ZERO;
    private BigDecimal marginPercentage = BigDecimal.ZERO;

    @Min(0)
    private Integer designDurationDays = 0;

    @Min(0)
    private Integer procurementDurationDays = 0;

    @Min(0)
    private Integer developmentDurationDays = 0;

    @Min(0)
    private Integer testingDurationDays = 0;

    @Min(0)
    private Integer installationDurationDays = 0;

    @Min(0)
    private Integer trainingDurationDays = 0;

    @Min(0)
    private Integer deliveryDurationDays = 0;

    @Valid
    @NotNull(message = "Line items list cannot be null")
    private List<DepartmentEstimateLineItemRequest> lineItems = new ArrayList<>();

    public DepartmentEstimateSaveRequest() {}

    public BigDecimal getContingencyPercentage() { return contingencyPercentage; }
    public void setContingencyPercentage(BigDecimal contingencyPercentage) { this.contingencyPercentage = contingencyPercentage; }

    public BigDecimal getContingencyAmount() { return contingencyAmount; }
    public void setContingencyAmount(BigDecimal contingencyAmount) { this.contingencyAmount = contingencyAmount; }

    public BigDecimal getTaxPercentage() { return taxPercentage; }
    public void setTaxPercentage(BigDecimal taxPercentage) { this.taxPercentage = taxPercentage; }

    public BigDecimal getMarginPercentage() { return marginPercentage; }
    public void setMarginPercentage(BigDecimal marginPercentage) { this.marginPercentage = marginPercentage; }

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

    public List<DepartmentEstimateLineItemRequest> getLineItems() { return lineItems; }
    public void setLineItems(List<DepartmentEstimateLineItemRequest> lineItems) { this.lineItems = lineItems; }
}
