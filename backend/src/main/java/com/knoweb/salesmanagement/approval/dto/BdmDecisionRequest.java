package com.knoweb.salesmanagement.approval.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class BdmDecisionRequest {
    private String comments;

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
}
