package com.knoweb.salesmanagement.opportunity.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class UpdateOpportunityRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Product category is required")
    private UUID productCategoryId;

    @NotNull(message = "Assigned sales officer is required")
    private UUID assignedSalesOfficerId;

    @NotNull(message = "Estimated value is required")
    @DecimalMin(value = "0.0", message = "Estimated value must be greater than or equal to 0")
    private BigDecimal estimatedValue;

    @NotNull(message = "Expected close date is required")
    private LocalDate expectedCloseDate;

    // Getters and Setters

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public UUID getProductCategoryId() {
        return productCategoryId;
    }

    public void setProductCategoryId(UUID productCategoryId) {
        this.productCategoryId = productCategoryId;
    }

    public UUID getAssignedSalesOfficerId() {
        return assignedSalesOfficerId;
    }

    public void setAssignedSalesOfficerId(UUID assignedSalesOfficerId) {
        this.assignedSalesOfficerId = assignedSalesOfficerId;
    }

    public BigDecimal getEstimatedValue() {
        return estimatedValue;
    }

    public void setEstimatedValue(BigDecimal estimatedValue) {
        this.estimatedValue = estimatedValue;
    }

    public LocalDate getExpectedCloseDate() {
        return expectedCloseDate;
    }

    public void setExpectedCloseDate(LocalDate expectedCloseDate) {
        this.expectedCloseDate = expectedCloseDate;
    }
}
