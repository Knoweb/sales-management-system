package com.knoweb.salesmanagement.lead.entity;

import com.knoweb.salesmanagement.client.entity.Client;
import com.knoweb.salesmanagement.employee.entity.Employee;
import com.knoweb.salesmanagement.lead.enums.InquirySource;
import com.knoweb.salesmanagement.lead.enums.LeadStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "leads")
public class Lead {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_id")
    private com.knoweb.salesmanagement.client.entity.ClientContact contact;

    @Column(nullable = false, length = 255)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "inquiry_source", nullable = false, length = 50)
    private InquirySource inquirySource;

    @Column(name = "interested_product", length = 255)
    private String interestedProduct;

    @Column(name = "initial_request", columnDefinition = "TEXT")
    private String initialRequest;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private LeadStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private Employee assignedTo;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marketing_campaign_id")
    private com.knoweb.salesmanagement.marketingroi.entity.MarketingCampaign marketingCampaign;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "initial_meeting_at")
    private OffsetDateTime initialMeetingAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "updated_by")
    private UUID updatedBy;

    public Lead() {
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }
    
    public com.knoweb.salesmanagement.client.entity.ClientContact getContact() { return contact; }
    public void setContact(com.knoweb.salesmanagement.client.entity.ClientContact contact) { this.contact = contact; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public InquirySource getInquirySource() { return inquirySource; }
    public void setInquirySource(InquirySource inquirySource) { this.inquirySource = inquirySource; }
    
    public String getInterestedProduct() { return interestedProduct; }
    public void setInterestedProduct(String interestedProduct) { this.interestedProduct = interestedProduct; }
    
    public String getInitialRequest() { return initialRequest; }
    public void setInitialRequest(String initialRequest) { this.initialRequest = initialRequest; }
    
    public LeadStatus getStatus() { return status; }
    public void setStatus(LeadStatus status) { this.status = status; }
    
    public Employee getAssignedTo() { return assignedTo; }
    public void setAssignedTo(Employee assignedTo) { this.assignedTo = assignedTo; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    
    public com.knoweb.salesmanagement.marketingroi.entity.MarketingCampaign getMarketingCampaign() { return marketingCampaign; }
    public void setMarketingCampaign(com.knoweb.salesmanagement.marketingroi.entity.MarketingCampaign marketingCampaign) { this.marketingCampaign = marketingCampaign; }
    
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    
    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }
    
    public UUID getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(UUID updatedBy) { this.updatedBy = updatedBy; }

    public OffsetDateTime getInitialMeetingAt() { return initialMeetingAt; }
    public void setInitialMeetingAt(OffsetDateTime initialMeetingAt) { this.initialMeetingAt = initialMeetingAt; }
}
