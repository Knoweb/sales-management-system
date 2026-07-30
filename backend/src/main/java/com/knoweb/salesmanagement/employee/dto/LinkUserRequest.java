package com.knoweb.salesmanagement.employee.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class LinkUserRequest {
    @NotNull(message = "User ID is required")
    private UUID userId;

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }
}
