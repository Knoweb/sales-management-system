package com.knoweb.salesmanagement.costing.dto;

import jakarta.validation.constraints.NotBlank;

public class RevisionRequest {

    @NotBlank(message = "Revision notes are required")
    private String revisionNotes;

    public RevisionRequest() {}

    public RevisionRequest(String revisionNotes) {
        this.revisionNotes = revisionNotes;
    }

    public String getRevisionNotes() { return revisionNotes; }
    public void setRevisionNotes(String revisionNotes) { this.revisionNotes = revisionNotes; }
}
