package com.knoweb.salesmanagement.lead.service;

import com.knoweb.salesmanagement.client.entity.Client;
import com.knoweb.salesmanagement.client.repository.ClientRepository;
import com.knoweb.salesmanagement.common.exception.ResourceNotFoundException;
import com.knoweb.salesmanagement.employee.entity.Employee;
import com.knoweb.salesmanagement.employee.repository.EmployeeRepository;
import com.knoweb.salesmanagement.lead.dto.*;
import com.knoweb.salesmanagement.lead.entity.FollowUp;
import com.knoweb.salesmanagement.lead.entity.Lead;
import com.knoweb.salesmanagement.lead.entity.LeadActivity;
import com.knoweb.salesmanagement.lead.enums.ActivityType;
import com.knoweb.salesmanagement.lead.enums.FollowUpStatus;
import com.knoweb.salesmanagement.lead.enums.LeadStatus;
import com.knoweb.salesmanagement.lead.repository.FollowUpRepository;
import com.knoweb.salesmanagement.lead.repository.LeadActivityRepository;
import com.knoweb.salesmanagement.lead.repository.LeadRepository;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LeadService {

    private final LeadRepository leadRepository;
    private final LeadActivityRepository leadActivityRepository;
    private final FollowUpRepository followUpRepository;
    private final ClientRepository clientRepository;
    private final com.knoweb.salesmanagement.client.repository.ClientContactRepository clientContactRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final LeadMapper leadMapper;

    public LeadService(LeadRepository leadRepository,
                       LeadActivityRepository leadActivityRepository,
                       FollowUpRepository followUpRepository,
                       ClientRepository clientRepository,
                       com.knoweb.salesmanagement.client.repository.ClientContactRepository clientContactRepository,
                       EmployeeRepository employeeRepository,
                       UserRepository userRepository,
                       LeadMapper leadMapper) {
        this.leadRepository = leadRepository;
        this.leadActivityRepository = leadActivityRepository;
        this.followUpRepository = followUpRepository;
        this.clientRepository = clientRepository;
        this.clientContactRepository = clientContactRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.leadMapper = leadMapper;
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    private Employee getCurrentEmployee() {
        User user = getAuthenticatedUser();
        if (user == null) return null;
        return employeeRepository.findByUserId(user.getId()).orElse(null);
    }

    private boolean hasAuthority(String authority) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals(authority));
    }

    private void validateLeadReadAccess(Lead lead) {
        if (hasAuthority("LEAD_READ_ALL")) return;
        
        Employee currentEmployee = getCurrentEmployee();
        if (currentEmployee == null || lead.getAssignedTo() == null || !lead.getAssignedTo().getId().equals(currentEmployee.getId())) {
            throw new AccessDeniedException("You do not have permission to view this lead");
        }
    }

    private void validateLeadUpdateAccess(Lead lead) {
        if (hasAuthority("LEAD_UPDATE_ALL")) return;
        
        Employee currentEmployee = getCurrentEmployee();
        if (currentEmployee == null || lead.getAssignedTo() == null || !lead.getAssignedTo().getId().equals(currentEmployee.getId())) {
            throw new AccessDeniedException("You do not have permission to modify this lead");
        }
    }

    private void logSystemActivity(Lead lead, String description) {
        LeadActivity activity = new LeadActivity();
        activity.setLead(lead);
        activity.setActivityType(ActivityType.SYSTEM_EVENT);
        activity.setDescription(description);
        activity.setActivityDate(OffsetDateTime.now());
        leadActivityRepository.save(activity);
    }

    @Transactional(readOnly = true)
    public Page<LeadDTO> searchLeads(String search, LeadStatus status, Boolean active, UUID clientId, Pageable pageable) {
        UUID assignedToFilter = null;
        if (!hasAuthority("LEAD_READ_ALL")) {
            Employee emp = getCurrentEmployee();
            if (emp != null) {
                assignedToFilter = emp.getId();
            } else {
                // Return empty if employee not found but needs ownership check
                assignedToFilter = UUID.randomUUID(); // hack to return nothing
            }
        }
        
        final UUID finalAssignedToFilter = assignedToFilter;

        Specification<Lead> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("title")), "%" + search.trim().toLowerCase() + "%"));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (finalAssignedToFilter != null) {
                predicates.add(cb.equal(root.join("assignedTo").get("id"), finalAssignedToFilter));
            }

            if (active != null) {
                predicates.add(cb.equal(root.get("active"), active));
            }

            if (clientId != null) {
                predicates.add(cb.equal(root.join("client").get("id"), clientId));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return leadRepository.findAll(spec, pageable).map(leadMapper::toDto);
    }

    @Transactional(readOnly = true)
    public LeadDTO getLeadById(UUID id) {
        Lead lead = leadRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Lead not found"));
        validateLeadReadAccess(lead);
        return leadMapper.toDto(lead);
    }

    @Transactional
    public LeadDTO createLead(LeadRequest request) {
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));

        Lead lead = new Lead();
        lead.setClient(client);

        if (request.getContactId() != null) {
            com.knoweb.salesmanagement.client.entity.ClientContact contact = clientContactRepository.findById(request.getContactId())
                    .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));
            if (!contact.getClient().getId().equals(client.getId())) {
                throw new IllegalArgumentException("Selected contact does not belong to the selected client");
            }
            lead.setContact(contact);
        }

        lead.setTitle(request.getTitle());
        lead.setInquirySource(request.getInquirySource());
        lead.setInterestedProduct(request.getInterestedProduct());
        lead.setInitialRequest(request.getInitialRequest());
        lead.setStatus(request.getStatus());
        lead.setNotes(request.getNotes());
        lead.setInitialMeetingAt(request.getInitialMeetingAt());
        
        // Auto-assign to current employee if not specified or no assign authority
        Employee currentEmployee = getCurrentEmployee();
        lead.setAssignedTo(currentEmployee);

        lead = leadRepository.save(lead);
        logSystemActivity(lead, "Lead created");
        return leadMapper.toDto(lead);
    }

    @Transactional
    public LeadDTO updateLead(UUID id, LeadRequest request) {
        Lead lead = leadRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Lead not found"));
        validateLeadUpdateAccess(lead);

        if (request.getContactId() != null) {
            com.knoweb.salesmanagement.client.entity.ClientContact contact = clientContactRepository.findById(request.getContactId())
                    .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));
            if (!contact.getClient().getId().equals(lead.getClient().getId())) {
                throw new IllegalArgumentException("Selected contact does not belong to the lead's client");
            }
            lead.setContact(contact);
        } else {
            lead.setContact(null);
        }

        lead.setTitle(request.getTitle());
        lead.setInquirySource(request.getInquirySource());
        lead.setInterestedProduct(request.getInterestedProduct());
        lead.setInitialRequest(request.getInitialRequest());
        lead.setStatus(request.getStatus());
        lead.setNotes(request.getNotes());
        lead.setInitialMeetingAt(request.getInitialMeetingAt());

        lead = leadRepository.save(lead);
        logSystemActivity(lead, "Lead details updated");
        return leadMapper.toDto(lead);
    }

    @Transactional
    public LeadDTO assignLead(UUID id, LeadAssignRequest request) {
        Lead lead = leadRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Lead not found"));
        
        Employee assignee = employeeRepository.findById(request.getAssignedTo())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        
        String oldName = lead.getAssignedTo() != null ? lead.getAssignedTo().getFirstName() + " " + lead.getAssignedTo().getLastName() : "Unassigned";
        String newName = assignee.getFirstName() + " " + assignee.getLastName();

        if (!oldName.equals(newName)) {
            lead.setAssignedTo(assignee);
            lead = leadRepository.save(lead);
            logSystemActivity(lead, "Sales Officer reassigned from " + oldName + " to " + newName);
        }

        return leadMapper.toDto(lead);
    }

    @Transactional
    public LeadDTO updateLeadStatus(UUID id, LeadStatusRequest request) {
        Lead lead = leadRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Lead not found"));
        validateLeadUpdateAccess(lead);

        boolean updated = false;

        if (request.getStatus() != null) {
            LeadStatus oldStatus = lead.getStatus();
            if (oldStatus != request.getStatus()) {
                lead.setStatus(request.getStatus());
                if (request.getNotes() != null && !request.getNotes().isEmpty()) {
                    lead.setNotes(request.getNotes());
                }
                logSystemActivity(lead, "Status changed from " + oldStatus + " to " + request.getStatus());
                updated = true;
            }
        }

        if (request.getActive() != null) {
            boolean oldActive = lead.isActive();
            if (oldActive != request.getActive()) {
                lead.setActive(request.getActive());
                logSystemActivity(lead, request.getActive() ? "Lead reactivated" : "Lead deactivated");
                updated = true;
            }
        }

        if (updated) {
            lead = leadRepository.save(lead);
        }

        return leadMapper.toDto(lead);
    }

    @Transactional
    public void deleteLead(UUID id) {
        Lead lead = leadRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Lead not found"));
        if (!hasAuthority("LEAD_DELETE")) {
            throw new AccessDeniedException("You do not have permission to delete leads");
        }
        lead.setActive(false);
        leadRepository.save(lead);
    }

    @Transactional
    public LeadActivityDTO addActivity(UUID leadId, LeadActivityRequest request) {
        Lead lead = leadRepository.findById(leadId).orElseThrow(() -> new ResourceNotFoundException("Lead not found"));
        validateLeadUpdateAccess(lead);

        LeadActivity activity = new LeadActivity();
        activity.setLead(lead);
        activity.setActivityType(request.getActivityType());
        activity.setDescription(request.getDescription());
        activity.setActivityDate(request.getActivityDate());
        
        activity = leadActivityRepository.save(activity);
        return leadMapper.toActivityDto(activity);
    }

    @Transactional(readOnly = true)
    public List<LeadActivityDTO> getActivities(UUID leadId) {
        Lead lead = leadRepository.findById(leadId).orElseThrow(() -> new ResourceNotFoundException("Lead not found"));
        validateLeadReadAccess(lead);
        
        return leadActivityRepository.findByLeadIdOrderByActivityDateDesc(leadId).stream()
                .map(leadMapper::toActivityDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public FollowUpDTO addFollowUp(UUID leadId, FollowUpRequest request) {
        Lead lead = leadRepository.findById(leadId).orElseThrow(() -> new ResourceNotFoundException("Lead not found"));
        validateLeadUpdateAccess(lead);

        FollowUp followUp = new FollowUp();
        followUp.setLead(lead);
        followUp.setFollowUpDate(request.getFollowUpDate());
        followUp.setStatus(request.getStatus());
        followUp.setNotes(request.getNotes());
        
        if (request.getAssignedTo() != null) {
            Employee assignee = employeeRepository.findById(request.getAssignedTo())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
            followUp.setAssignedTo(assignee);
        } else {
            followUp.setAssignedTo(getCurrentEmployee());
        }

        followUp = followUpRepository.save(followUp);
        logSystemActivity(lead, "Follow-up created");
        return leadMapper.toFollowUpDto(followUp);
    }

    @Transactional(readOnly = true)
    public List<FollowUpDTO> getFollowUps(UUID leadId) {
        Lead lead = leadRepository.findById(leadId).orElseThrow(() -> new ResourceNotFoundException("Lead not found"));
        validateLeadReadAccess(lead);
        
        return followUpRepository.findByLeadIdOrderByFollowUpDateAsc(leadId).stream()
                .map(leadMapper::toFollowUpDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public FollowUpDTO updateFollowUp(UUID leadId, UUID followUpId, FollowUpRequest request) {
        Lead lead = leadRepository.findById(leadId).orElseThrow(() -> new ResourceNotFoundException("Lead not found"));
        validateLeadUpdateAccess(lead);

        FollowUp followUp = followUpRepository.findById(followUpId)
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up not found"));

        if (!followUp.getLead().getId().equals(leadId)) {
            throw new ResourceNotFoundException("Follow-up does not belong to this lead");
        }

        followUp.setFollowUpDate(request.getFollowUpDate());
        followUp.setStatus(request.getStatus());
        followUp.setNotes(request.getNotes());

        if (request.getAssignedTo() != null) {
            Employee assignee = employeeRepository.findById(request.getAssignedTo())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
            followUp.setAssignedTo(assignee);
        } else {
            followUp.setAssignedTo(getCurrentEmployee());
        }

        followUp = followUpRepository.save(followUp);
        return leadMapper.toFollowUpDto(followUp);
    }

    @Transactional
    public FollowUpDTO completeFollowUp(UUID leadId, UUID followUpId, FollowUpCompleteRequest request) {
        Lead lead = leadRepository.findById(leadId).orElseThrow(() -> new ResourceNotFoundException("Lead not found"));
        validateLeadUpdateAccess(lead);

        FollowUp followUp = followUpRepository.findById(followUpId)
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up not found"));

        if (!followUp.getLead().getId().equals(leadId)) {
            throw new ResourceNotFoundException("Follow-up does not belong to this lead");
        }

        followUp.setStatus(FollowUpStatus.COMPLETED);
        if (request != null && request.getNotes() != null && !request.getNotes().isEmpty()) {
            followUp.setNotes(request.getNotes());
        }

        followUp = followUpRepository.save(followUp);
        logSystemActivity(lead, "Follow-up marked as completed");

        return leadMapper.toFollowUpDto(followUp);
    }
}
