package com.knoweb.salesmanagement.approval.entity;

import com.knoweb.salesmanagement.user.entity.User;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "bdm_approval_comments")
public class BdmApprovalComment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bdm_approval_id", nullable = false)
    private BdmApproval bdmApproval;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String comment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    public BdmApprovalComment() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public BdmApproval getBdmApproval() { return bdmApproval; }
    public void setBdmApproval(BdmApproval bdmApproval) { this.bdmApproval = bdmApproval; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
