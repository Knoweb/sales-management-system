package com.knoweb.salesmanagement.approval.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ClientDecisionRequest {
    @NotBlank(message = "Verifier name is required")
    private String verifierName;

    private String verifierEmail;

    private String comments;

    @NotNull(message = "Digital confirmation is required")
    private Boolean digitalConfirmation;

    public String getVerifierName() { return verifierName; }
    public void setVerifierName(String verifierName) { this.verifierName = verifierName; }
    public String getVerifierEmail() { return verifierEmail; }
    public void setVerifierEmail(String verifierEmail) { this.verifierEmail = verifierEmail; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    public Boolean getDigitalConfirmation() { return digitalConfirmation; }
    public void setDigitalConfirmation(Boolean digitalConfirmation) { this.digitalConfirmation = digitalConfirmation; }
}
