package com.knoweb.salesmanagement.quotation.dto;

public class QuotationApprovalDto {
    private String action; // e.g. APPROVE, REJECT, RETURN, REVISE, SUBMIT_FOR_APPROVAL
    private String comments;

    public QuotationApprovalDto() {}

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
}
