package com.knoweb.salesmanagement.quotation.dto;

import com.knoweb.salesmanagement.quotation.enums.QuotationStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class QuotationDto {
    private UUID id;
    private String quotationNumber;
    private Integer version;
    private UUID approvedEstimateId;
    
    private String clientDetails;
    private String projectTitle;
    private String projectDescription;
    private String scopeOfWork;
    
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalTotal;
    
    private String paymentTerms;
    private String deliveryPeriod;
    private String warrantyInformation;
    private String validityPeriod;
    private String termsAndConditions;
    
    private QuotationStatus status;
    private List<QuotationItemDto> items;
    
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    
    public QuotationDto() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getQuotationNumber() { return quotationNumber; }
    public void setQuotationNumber(String quotationNumber) { this.quotationNumber = quotationNumber; }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }

    public UUID getApprovedEstimateId() { return approvedEstimateId; }
    public void setApprovedEstimateId(UUID approvedEstimateId) { this.approvedEstimateId = approvedEstimateId; }

    public String getClientDetails() { return clientDetails; }
    public void setClientDetails(String clientDetails) { this.clientDetails = clientDetails; }

    public String getProjectTitle() { return projectTitle; }
    public void setProjectTitle(String projectTitle) { this.projectTitle = projectTitle; }

    public String getProjectDescription() { return projectDescription; }
    public void setProjectDescription(String projectDescription) { this.projectDescription = projectDescription; }

    public String getScopeOfWork() { return scopeOfWork; }
    public void setScopeOfWork(String scopeOfWork) { this.scopeOfWork = scopeOfWork; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }

    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }

    public BigDecimal getFinalTotal() { return finalTotal; }
    public void setFinalTotal(BigDecimal finalTotal) { this.finalTotal = finalTotal; }

    public String getPaymentTerms() { return paymentTerms; }
    public void setPaymentTerms(String paymentTerms) { this.paymentTerms = paymentTerms; }

    public String getDeliveryPeriod() { return deliveryPeriod; }
    public void setDeliveryPeriod(String deliveryPeriod) { this.deliveryPeriod = deliveryPeriod; }

    public String getWarrantyInformation() { return warrantyInformation; }
    public void setWarrantyInformation(String warrantyInformation) { this.warrantyInformation = warrantyInformation; }

    public String getValidityPeriod() { return validityPeriod; }
    public void setValidityPeriod(String validityPeriod) { this.validityPeriod = validityPeriod; }

    public String getTermsAndConditions() { return termsAndConditions; }
    public void setTermsAndConditions(String termsAndConditions) { this.termsAndConditions = termsAndConditions; }

    public QuotationStatus getStatus() { return status; }
    public void setStatus(QuotationStatus status) { this.status = status; }

    public List<QuotationItemDto> getItems() { return items; }
    public void setItems(List<QuotationItemDto> items) { this.items = items; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
