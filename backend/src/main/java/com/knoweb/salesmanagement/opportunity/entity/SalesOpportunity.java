package com.knoweb.salesmanagement.opportunity.entity;

import com.knoweb.salesmanagement.client.entity.Client;
import com.knoweb.salesmanagement.client.entity.ClientContact;
import com.knoweb.salesmanagement.employee.entity.Employee;
import com.knoweb.salesmanagement.lead.entity.Lead;
import com.knoweb.salesmanagement.opportunity.enums.OpportunityStage;
import com.knoweb.salesmanagement.productcategory.entity.ProductCategory;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "sales_opportunities")
public class SalesOpportunity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "opportunity_number", nullable = false, unique = true, length = 100)
    private String opportunityNumber;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id", nullable = false, unique = true)
    private Lead lead;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "primary_contact_id")
    private ClientContact primaryContact;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_category_id", nullable = false)
    private ProductCategory productCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_sales_officer_id")
    private Employee assignedSalesOfficer;

    @Column(name = "estimated_value", precision = 19, scale = 2)
    private BigDecimal estimatedValue;

    @Column(length = 3)
    private String currency;

    @Column(name = "probability_percent")
    private Integer probabilityPercent;

    @Column(name = "expected_close_date")
    private LocalDate expectedCloseDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private OpportunityStage stage;

    @Column(name = "on_hold_reason", columnDefinition = "TEXT")
    private String onHoldReason;

    @Column(name = "lost_reason", columnDefinition = "TEXT")
    private String lostReason;

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

    public SalesOpportunity() {
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getOpportunityNumber() { return opportunityNumber; }
    public void setOpportunityNumber(String opportunityNumber) { this.opportunityNumber = opportunityNumber; }

    public Lead getLead() { return lead; }
    public void setLead(Lead lead) { this.lead = lead; }

    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }

    public ClientContact getPrimaryContact() { return primaryContact; }
    public void setPrimaryContact(ClientContact primaryContact) { this.primaryContact = primaryContact; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ProductCategory getProductCategory() { return productCategory; }
    public void setProductCategory(ProductCategory productCategory) { this.productCategory = productCategory; }

    public Employee getAssignedSalesOfficer() { return assignedSalesOfficer; }
    public void setAssignedSalesOfficer(Employee assignedSalesOfficer) { this.assignedSalesOfficer = assignedSalesOfficer; }

    public BigDecimal getEstimatedValue() { return estimatedValue; }
    public void setEstimatedValue(BigDecimal estimatedValue) { this.estimatedValue = estimatedValue; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public Integer getProbabilityPercent() { return probabilityPercent; }
    public void setProbabilityPercent(Integer probabilityPercent) { this.probabilityPercent = probabilityPercent; }

    public LocalDate getExpectedCloseDate() { return expectedCloseDate; }
    public void setExpectedCloseDate(LocalDate expectedCloseDate) { this.expectedCloseDate = expectedCloseDate; }

    public OpportunityStage getStage() { return stage; }
    public void setStage(OpportunityStage stage) { this.stage = stage; }

    public String getOnHoldReason() { return onHoldReason; }
    public void setOnHoldReason(String onHoldReason) { this.onHoldReason = onHoldReason; }

    public String getLostReason() { return lostReason; }
    public void setLostReason(String lostReason) { this.lostReason = lostReason; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }

    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }

    public UUID getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(UUID updatedBy) { this.updatedBy = updatedBy; }
}
