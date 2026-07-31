package com.knoweb.salesmanagement.lead.dto;

import com.knoweb.salesmanagement.lead.entity.FollowUp;
import com.knoweb.salesmanagement.lead.entity.Lead;
import com.knoweb.salesmanagement.lead.entity.LeadActivity;
import org.springframework.stereotype.Component;

@Component
public class LeadMapper {

    public LeadDTO toDto(Lead lead) {
        if (lead == null) return null;
        
        LeadDTO dto = new LeadDTO();
        dto.setId(lead.getId());
        dto.setClientId(lead.getClient().getId());
        dto.setClientName(lead.getClient().getName());
        dto.setTitle(lead.getTitle());
        dto.setInquirySource(lead.getInquirySource());
        dto.setInterestedProduct(lead.getInterestedProduct());
        dto.setInitialRequest(lead.getInitialRequest());
        dto.setStatus(lead.getStatus());
        dto.setNotes(lead.getNotes());
        dto.setActive(lead.isActive());
        dto.setInitialMeetingAt(lead.getInitialMeetingAt());
        dto.setCreatedAt(lead.getCreatedAt());
        dto.setUpdatedAt(lead.getUpdatedAt());
        
        if (lead.getContact() != null) {
            dto.setContactId(lead.getContact().getId());
            dto.setContactName(lead.getContact().getFirstName() + " " + lead.getContact().getLastName());
        }
        
        if (lead.getAssignedTo() != null) {
            dto.setAssignedTo(lead.getAssignedTo().getId());
            dto.setAssignedToName(lead.getAssignedTo().getFirstName() + " " + lead.getAssignedTo().getLastName());
        }
        return dto;
    }

    public LeadActivityDTO toActivityDto(LeadActivity activity) {
        if (activity == null) return null;
        
        LeadActivityDTO dto = new LeadActivityDTO();
        dto.setId(activity.getId());
        dto.setLeadId(activity.getLead().getId());
        dto.setActivityType(activity.getActivityType());
        dto.setDescription(activity.getDescription());
        dto.setActivityDate(activity.getActivityDate());
        dto.setCreatedAt(activity.getCreatedAt());
        dto.setCreatedBy(activity.getCreatedBy());
        return dto;
    }

    public FollowUpDTO toFollowUpDto(FollowUp followUp) {
        if (followUp == null) return null;
        
        FollowUpDTO dto = new FollowUpDTO();
        dto.setId(followUp.getId());
        dto.setLeadId(followUp.getLead().getId());
        dto.setFollowUpDate(followUp.getFollowUpDate());
        dto.setStatus(followUp.getStatus());
        dto.setNotes(followUp.getNotes());
        dto.setCreatedAt(followUp.getCreatedAt());
        dto.setUpdatedAt(followUp.getUpdatedAt());
        
        if (followUp.getAssignedTo() != null) {
            dto.setAssignedTo(followUp.getAssignedTo().getId());
            dto.setAssignedToName(followUp.getAssignedTo().getFirstName() + " " + followUp.getAssignedTo().getLastName());
        }
        return dto;
    }
}
