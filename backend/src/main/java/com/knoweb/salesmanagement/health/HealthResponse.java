package com.knoweb.salesmanagement.health;

import java.time.Instant;

public class HealthResponse {
    private final String status;
    private final String application;
    private final Instant timestamp;

    public HealthResponse(String status, String application, Instant timestamp) {
        this.status = status;
        this.application = application;
        this.timestamp = timestamp;
    }

    public String getStatus() {
        return status;
    }

    public String getApplication() {
        return application;
    }

    public Instant getTimestamp() {
        return timestamp;
    }
}
