package com.knoweb.salesmanagement.lead.service;

import com.knoweb.salesmanagement.attachment.event.AttachmentEvent;
import com.knoweb.salesmanagement.lead.entity.Lead;
import com.knoweb.salesmanagement.lead.entity.LeadActivity;
import com.knoweb.salesmanagement.lead.enums.ActivityType;
import com.knoweb.salesmanagement.lead.repository.LeadActivityRepository;
import com.knoweb.salesmanagement.lead.repository.LeadRepository;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

@Component
public class LeadActivityEventListener {

    private final LeadRepository leadRepository;
    private final LeadActivityRepository leadActivityRepository;

    public LeadActivityEventListener(LeadRepository leadRepository, LeadActivityRepository leadActivityRepository) {
        this.leadRepository = leadRepository;
        this.leadActivityRepository = leadActivityRepository;
    }

    @EventListener
    public void handleAttachmentEvent(AttachmentEvent event) {
        if ("LEAD".equalsIgnoreCase(event.getEntityType())) {
            leadRepository.findById(event.getEntityId()).ifPresent(lead -> {
                LeadActivity activity = new LeadActivity();
                activity.setLead(lead);
                activity.setActivityType(ActivityType.SYSTEM_EVENT);
                
                String desc = "UPLOADED".equals(event.getAction()) 
                        ? "Attachment uploaded: " + event.getFileName()
                        : "Attachment removed: " + event.getFileName();
                
                activity.setDescription(desc);
                activity.setActivityDate(OffsetDateTime.now());
                
                // Auditing automatically sets createdBy via JpaAuditingConfig
                leadActivityRepository.save(activity);
            });
        }
    }
}
