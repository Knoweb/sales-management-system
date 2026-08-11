package com.knoweb.salesmanagement.virtualtour.entity;

import com.knoweb.salesmanagement.employee.entity.Employee;
import com.knoweb.salesmanagement.lead.entity.Lead;
import com.knoweb.salesmanagement.opportunity.entity.SalesOpportunity;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.virtualtour.enums.VirtualTourStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "virtual_tours")
public class VirtualTour {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id")
    private Lead lead;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opportunity_id")
    private SalesOpportunity opportunity;

    @Column(nullable = false, length = 100)
    private String platform;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private VirtualTourStatus status = VirtualTourStatus.SCHEDULED;

    @Column(name = "tour_date", nullable = false)
    private OffsetDateTime tourDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conducted_by")
    private Employee conductedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(length = 50)
    private String language;

    @Column(name = "demonstrated_product")
    private String demonstratedProduct;

    @Column(name = "client_response", columnDefinition = "TEXT")
    private String clientResponse;

    @Column(name = "probability_before")
    private Integer probabilityBefore;

    @Column(name = "probability_after")
    private Integer probabilityAfter;

    @Column(name = "follow_up_required")
    private Boolean followUpRequired;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    public VirtualTour() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Lead getLead() {
        return lead;
    }

    public void setLead(Lead lead) {
        this.lead = lead;
    }

    public SalesOpportunity getOpportunity() {
        return opportunity;
    }

    public void setOpportunity(SalesOpportunity opportunity) {
        this.opportunity = opportunity;
    }

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public VirtualTourStatus getStatus() {
        return status;
    }

    public void setStatus(VirtualTourStatus status) {
        this.status = status;
    }

    public OffsetDateTime getTourDate() {
        return tourDate;
    }

    public void setTourDate(OffsetDateTime tourDate) {
        this.tourDate = tourDate;
    }

    public Employee getConductedBy() {
        return conductedBy;
    }

    public void setConductedBy(Employee conductedBy) {
        this.conductedBy = conductedBy;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public User getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(User updatedBy) {
        this.updatedBy = updatedBy;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getDemonstratedProduct() {
        return demonstratedProduct;
    }

    public void setDemonstratedProduct(String demonstratedProduct) {
        this.demonstratedProduct = demonstratedProduct;
    }

    public String getClientResponse() {
        return clientResponse;
    }

    public void setClientResponse(String clientResponse) {
        this.clientResponse = clientResponse;
    }

    public Integer getProbabilityBefore() {
        return probabilityBefore;
    }

    public void setProbabilityBefore(Integer probabilityBefore) {
        this.probabilityBefore = probabilityBefore;
    }

    public Integer getProbabilityAfter() {
        return probabilityAfter;
    }

    public void setProbabilityAfter(Integer probabilityAfter) {
        this.probabilityAfter = probabilityAfter;
    }

    public Boolean getFollowUpRequired() {
        return followUpRequired;
    }

    public void setFollowUpRequired(Boolean followUpRequired) {
        this.followUpRequired = followUpRequired;
    }
}
