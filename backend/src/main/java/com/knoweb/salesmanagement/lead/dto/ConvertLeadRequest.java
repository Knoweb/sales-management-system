package com.knoweb.salesmanagement.lead.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public class ConvertLeadRequest {

    @NotNull
    @Size(max = 255)
    private String title;

    @Size(max = 5000)
    private String description;

    @NotNull
    private UUID productCategoryId;

    @NotNull
    private UUID assignedSalesOfficerId;

    @Min(0)
    private BigDecimal estimatedValue;

    @Size(min = 3, max = 3)
    private String currency;

    @Min(0)
    private Integer probabilityPercent;

    private LocalDate expectedCloseDate;

    private UUID primaryContactId;

    private OffsetDateTime initialMeetingAt;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public UUID getProductCategoryId() { return productCategoryId; }
    public void setProductCategoryId(UUID productCategoryId) { this.productCategoryId = productCategoryId; }

    public UUID getAssignedSalesOfficerId() { return assignedSalesOfficerId; }
    public void setAssignedSalesOfficerId(UUID assignedSalesOfficerId) { this.assignedSalesOfficerId = assignedSalesOfficerId; }

    public BigDecimal getEstimatedValue() { return estimatedValue; }
    public void setEstimatedValue(BigDecimal estimatedValue) { this.estimatedValue = estimatedValue; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public Integer getProbabilityPercent() { return probabilityPercent; }
    public void setProbabilityPercent(Integer probabilityPercent) { this.probabilityPercent = probabilityPercent; }

    public LocalDate getExpectedCloseDate() { return expectedCloseDate; }
    public void setExpectedCloseDate(LocalDate expectedCloseDate) { this.expectedCloseDate = expectedCloseDate; }

    public UUID getPrimaryContactId() { return primaryContactId; }
    public void setPrimaryContactId(UUID primaryContactId) { this.primaryContactId = primaryContactId; }

    public OffsetDateTime getInitialMeetingAt() { return initialMeetingAt; }
    public void setInitialMeetingAt(OffsetDateTime initialMeetingAt) { this.initialMeetingAt = initialMeetingAt; }
}
