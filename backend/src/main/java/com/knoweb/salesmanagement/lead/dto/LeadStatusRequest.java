package com.knoweb.salesmanagement.lead.dto;

import com.knoweb.salesmanagement.lead.enums.LeadStatus;

public class LeadStatusRequest {

    private LeadStatus status;
    
    private Boolean active;
    
    private String notes;

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LeadStatus getStatus() {
        return status;
    }

    public void setStatus(LeadStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
