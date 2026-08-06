package com.knoweb.salesmanagement.quotation.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class QuotationApprovalHistoryDto {
    private String id;
    private String action;
    private String comments;
    private String createdBy;
    private String createdByName;
    private OffsetDateTime createdAt;

    public QuotationApprovalHistoryDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
