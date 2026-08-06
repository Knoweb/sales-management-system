package com.knoweb.salesmanagement.quotation.dto;

public class ClientDecisionDto {
    private String action;
    private String comments;

    public ClientDecisionDto() {}

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }
}
