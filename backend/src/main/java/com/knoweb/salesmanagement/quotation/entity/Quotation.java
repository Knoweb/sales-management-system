package com.knoweb.salesmanagement.quotation.entity;

import com.knoweb.salesmanagement.quotation.enums.QuotationStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "quotations")
public class Quotation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "quotation_number", nullable = false, unique = true)
    private String quotationNumber;

    @Column(name = "version", nullable = false)
    private Integer version = 0;

    @Column(name = "approved_estimate_id")
    private UUID approvedEstimateId;

    @Column(name = "client_details", columnDefinition = "TEXT")
    private String clientDetails;

    @Column(name = "project_title")
    private String projectTitle;

    @Column(name = "project_description", columnDefinition = "TEXT")
    private String projectDescription;

    @Column(name = "scope_of_work", columnDefinition = "TEXT")
    private String scopeOfWork;

    @Column(name = "subtotal", precision = 19, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "tax_amount", precision = 19, scale = 2)
    private BigDecimal taxAmount;

    @Column(name = "discount_amount", precision = 19, scale = 2)
    private BigDecimal discountAmount;

    @Column(name = "final_total", precision = 19, scale = 2)
    private BigDecimal finalTotal;

    @Column(name = "payment_terms", columnDefinition = "TEXT")
    private String paymentTerms;

    @Column(name = "delivery_period")
    private String deliveryPeriod;

    @Column(name = "warranty_information", columnDefinition = "TEXT")
    private String warrantyInformation;

    @Column(name = "validity_period")
    private String validityPeriod;

    @Column(name = "terms_and_conditions", columnDefinition = "TEXT")
    private String termsAndConditions;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private QuotationStatus status = QuotationStatus.DRAFT;

    @OneToMany(mappedBy = "quotation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuotationItem> items = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "updated_by")
    private UUID updatedBy;

    public Quotation() {}

    // Getters and Setters

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

    public List<QuotationItem> getItems() { return items; }
    public void setItems(List<QuotationItem> items) { this.items = items; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }

    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }

    public UUID getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(UUID updatedBy) { this.updatedBy = updatedBy; }
}
