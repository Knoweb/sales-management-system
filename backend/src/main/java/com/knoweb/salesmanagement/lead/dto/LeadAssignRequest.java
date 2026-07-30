package com.knoweb.salesmanagement.lead.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class LeadAssignRequest {
    @NotNull(message = "Assigned To employee ID is required")
    private UUID assignedTo;
    
    public UUID getAssignedTo() { return assignedTo; }
    public void setAssignedTo(UUID assignedTo) { this.assignedTo = assignedTo; }
}
