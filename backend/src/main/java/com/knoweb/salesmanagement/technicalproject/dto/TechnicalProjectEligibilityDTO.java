package com.knoweb.salesmanagement.technicalproject.dto;

import com.knoweb.salesmanagement.technicalproject.enums.TechnicalProjectEligibilityReason;

import java.util.UUID;

public class TechnicalProjectEligibilityDTO {
    private UUID projectBriefId;
    private boolean eligible;
    private boolean verified;
    private boolean bdmApproved;
    private boolean technicalProjectAlreadyExists;
    private UUID clientVerificationId;
    private UUID bdmApprovalId;
    private Integer approvedProjectBriefVersionId;
    private TechnicalProjectEligibilityReason reasonCode;
    private String reason;

    public TechnicalProjectEligibilityDTO() {}

    public UUID getProjectBriefId() { return projectBriefId; }
    public void setProjectBriefId(UUID projectBriefId) { this.projectBriefId = projectBriefId; }
    
    public boolean isEligible() { return eligible; }
    public void setEligible(boolean eligible) { this.eligible = eligible; }
    
    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
    
    public boolean isBdmApproved() { return bdmApproved; }
    public void setBdmApproved(boolean bdmApproved) { this.bdmApproved = bdmApproved; }
    
    public boolean isTechnicalProjectAlreadyExists() { return technicalProjectAlreadyExists; }
    public void setTechnicalProjectAlreadyExists(boolean technicalProjectAlreadyExists) { this.technicalProjectAlreadyExists = technicalProjectAlreadyExists; }
    
    public UUID getClientVerificationId() { return clientVerificationId; }
    public void setClientVerificationId(UUID clientVerificationId) { this.clientVerificationId = clientVerificationId; }
    
    public UUID getBdmApprovalId() { return bdmApprovalId; }
    public void setBdmApprovalId(UUID bdmApprovalId) { this.bdmApprovalId = bdmApprovalId; }
    
    public Integer getApprovedProjectBriefVersionId() { return approvedProjectBriefVersionId; }
    public void setApprovedProjectBriefVersionId(Integer approvedProjectBriefVersionId) { this.approvedProjectBriefVersionId = approvedProjectBriefVersionId; }
    
    public TechnicalProjectEligibilityReason getReasonCode() { return reasonCode; }
    public void setReasonCode(TechnicalProjectEligibilityReason reasonCode) { this.reasonCode = reasonCode; }
    
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
