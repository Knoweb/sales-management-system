package com.knoweb.salesmanagement.technicalproject.dto;

import com.knoweb.salesmanagement.approval.enums.BdmApprovalStatus;
import com.knoweb.salesmanagement.approval.enums.ClientVerificationStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

public class Phase6ApprovalSummaryDTO {
    private UUID clientVerificationId;
    private ClientVerificationStatus clientVerificationStatus;
    private OffsetDateTime verifiedDate;
    private String verifiedBy;

    private UUID bdmApprovalId;
    private BdmApprovalStatus bdmApprovalStatus;
    private OffsetDateTime approvedDate;
    private String approvedBy;
    private String approvalComments;

    public Phase6ApprovalSummaryDTO() {}

    public Phase6ApprovalSummaryDTO(UUID clientVerificationId, ClientVerificationStatus clientVerificationStatus, OffsetDateTime verifiedDate, String verifiedBy, UUID bdmApprovalId, BdmApprovalStatus bdmApprovalStatus, OffsetDateTime approvedDate, String approvedBy, String approvalComments) {
        this.clientVerificationId = clientVerificationId;
        this.clientVerificationStatus = clientVerificationStatus;
        this.verifiedDate = verifiedDate;
        this.verifiedBy = verifiedBy;
        this.bdmApprovalId = bdmApprovalId;
        this.bdmApprovalStatus = bdmApprovalStatus;
        this.approvedDate = approvedDate;
        this.approvedBy = approvedBy;
        this.approvalComments = approvalComments;
    }

    public UUID getClientVerificationId() {
        return clientVerificationId;
    }

    public void setClientVerificationId(UUID clientVerificationId) {
        this.clientVerificationId = clientVerificationId;
    }

    public ClientVerificationStatus getClientVerificationStatus() {
        return clientVerificationStatus;
    }

    public void setClientVerificationStatus(ClientVerificationStatus clientVerificationStatus) {
        this.clientVerificationStatus = clientVerificationStatus;
    }

    public OffsetDateTime getVerifiedDate() {
        return verifiedDate;
    }

    public void setVerifiedDate(OffsetDateTime verifiedDate) {
        this.verifiedDate = verifiedDate;
    }

    public String getVerifiedBy() {
        return verifiedBy;
    }

    public void setVerifiedBy(String verifiedBy) {
        this.verifiedBy = verifiedBy;
    }

    public UUID getBdmApprovalId() {
        return bdmApprovalId;
    }

    public void setBdmApprovalId(UUID bdmApprovalId) {
        this.bdmApprovalId = bdmApprovalId;
    }

    public BdmApprovalStatus getBdmApprovalStatus() {
        return bdmApprovalStatus;
    }

    public void setBdmApprovalStatus(BdmApprovalStatus bdmApprovalStatus) {
        this.bdmApprovalStatus = bdmApprovalStatus;
    }

    public OffsetDateTime getApprovedDate() {
        return approvedDate;
    }

    public void setApprovedDate(OffsetDateTime approvedDate) {
        this.approvedDate = approvedDate;
    }

    public String getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(String approvedBy) {
        this.approvedBy = approvedBy;
    }

    public String getApprovalComments() {
        return approvalComments;
    }

    public void setApprovalComments(String approvalComments) {
        this.approvalComments = approvalComments;
    }
}
