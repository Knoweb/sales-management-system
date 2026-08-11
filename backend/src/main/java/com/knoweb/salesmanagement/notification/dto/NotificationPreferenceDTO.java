package com.knoweb.salesmanagement.notification.dto;

import java.util.UUID;

public class NotificationPreferenceDTO {
    
    private UUID id;
    private String eventCategory;
    private String channel;
    private boolean isEnabled;

    public NotificationPreferenceDTO() {}

    public NotificationPreferenceDTO(UUID id, String eventCategory, String channel, boolean isEnabled) {
        this.id = id;
        this.eventCategory = eventCategory;
        this.channel = channel;
        this.isEnabled = isEnabled;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getEventCategory() { return eventCategory; }
    public void setEventCategory(String eventCategory) { this.eventCategory = eventCategory; }

    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }

    public boolean getIsEnabled() { return isEnabled; }
    public void setIsEnabled(boolean isEnabled) { this.isEnabled = isEnabled; }
}
