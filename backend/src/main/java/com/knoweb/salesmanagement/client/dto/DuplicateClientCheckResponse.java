package com.knoweb.salesmanagement.client.dto;

public class DuplicateClientCheckResponse {
    private boolean hasConflict;
    private boolean hasWarning;
    private String message;
    private String conflictReason; // e.g. "REGISTRATION_NUMBER", "EMAIL"
    
    public DuplicateClientCheckResponse() {}

    public DuplicateClientCheckResponse(boolean hasConflict, boolean hasWarning, String message, String conflictReason) {
        this.hasConflict = hasConflict;
        this.hasWarning = hasWarning;
        this.message = message;
        this.conflictReason = conflictReason;
    }

    public boolean isHasConflict() { return hasConflict; }
    public void setHasConflict(boolean hasConflict) { this.hasConflict = hasConflict; }

    public boolean isHasWarning() { return hasWarning; }
    public void setHasWarning(boolean hasWarning) { this.hasWarning = hasWarning; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getConflictReason() { return conflictReason; }
    public void setConflictReason(String conflictReason) { this.conflictReason = conflictReason; }
}
