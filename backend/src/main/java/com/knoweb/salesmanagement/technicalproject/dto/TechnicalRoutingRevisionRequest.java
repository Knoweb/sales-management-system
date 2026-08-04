package com.knoweb.salesmanagement.technicalproject.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TechnicalRoutingRevisionRequest extends TechnicalRoutingRequest {

    @NotBlank(message = "Revision reason is mandatory")
    private String revisionReason;

    @NotNull(message = "Optimistic lock version is required")
    private Integer optimisticLockVersion;

    public String getRevisionReason() {
        return revisionReason;
    }

    public void setRevisionReason(String revisionReason) {
        this.revisionReason = revisionReason;
    }

    public Integer getOptimisticLockVersion() {
        return optimisticLockVersion;
    }

    public void setOptimisticLockVersion(Integer optimisticLockVersion) {
        this.optimisticLockVersion = optimisticLockVersion;
    }
}
