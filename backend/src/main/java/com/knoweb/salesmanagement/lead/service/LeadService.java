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
import com.knoweb.salesmanagement.lead.repository.FollowUpRepository;
import com.knoweb.salesmanagement.lead.repository.LeadActivityRepository;
import com.knoweb.salesmanagement.lead.repository.LeadRepository;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LeadService {

    private final LeadRepository leadRepository;
    private final LeadActivityRepository leadActivityRepository;
    private final FollowUpRepository followUpRepository;
    private final ClientRepository clientRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final LeadMapper leadMapper;

    public LeadService(LeadRepository leadRepository,
                       LeadActivityRepository leadActivityRepository,
                       FollowUpRepository followUpRepository,
                       ClientRepository clientRepository,
                       EmployeeRepository employeeRepository,
                       UserRepository userRepository,
                       LeadMapper leadMapper) {
        this.leadRepository = leadRepository;
        this.leadActivityRepository = leadActivityRepository;
        this.followUpRepository = followUpRepository;
        this.clientRepository = clientRepository;
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
        if (hasAuthority("LEAD_READ_ALL") || hasAuthority("ROLE_SYSTEM_ADMIN")) return;
        
        Employee currentEmployee = getCurrentEmployee();
        if (currentEmployee == null || lead.getAssignedTo() == null || !lead.getAssignedTo().getId().equals(currentEmployee.getId())) {
            throw new AccessDeniedException("You do not have permission to view this lead");
        }
    }

    private void validateLeadUpdateAccess(Lead lead) {
        if (hasAuthority("LEAD_UPDATE_ALL") || hasAuthority("ROLE_SYSTEM_ADMIN")) return;
        
        Employee currentEmployee = getCurrentEmployee();
        if (currentEmployee == null || lead.getAssignedTo() == null || !lead.getAssignedTo().getId().equals(currentEmployee.getId())) {
            throw new AccessDeniedException("You do not have permission to modify this lead");
        }
    }

    @Transactional(readOnly = true)
    public Page<LeadDTO> searchLeads(String search, String status, Boolean active, Pageable pageable) {
        UUID assignedToFilter = null;
        if (!hasAuthority("LEAD_READ_ALL") && !hasAuthority("ROLE_SYSTEM_ADMIN")) {
            Employee emp = getCurrentEmployee();
            if (emp != null) {
                assignedToFilter = emp.getId();
            } else {
                // Return empty if employee not found but needs ownership check
                assignedToFilter = UUID.randomUUID(); // hack to return nothing
            }
        }
        return leadRepository.searchLeads(search, status, assignedToFilter, active, pageable)
                .map(leadMapper::toDto);
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
        lead.setTitle(request.getTitle());
        lead.setInquirySource(request.getInquirySource());
        lead.setInterestedProduct(request.getInterestedProduct());
        lead.setInitialRequest(request.getInitialRequest());
        lead.setStatus(request.getStatus());
        lead.setNotes(request.getNotes());
        
        // Auto-assign to current employee if not specified or no assign authority
        Employee currentEmployee = getCurrentEmployee();
        lead.setAssignedTo(currentEmployee);

        lead = leadRepository.save(lead);
        return leadMapper.toDto(lead);
    }

    @Transactional
    public LeadDTO updateLead(UUID id, LeadRequest request) {
        Lead lead = leadRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Lead not found"));
        validateLeadUpdateAccess(lead);

        lead.setTitle(request.getTitle());
        lead.setInquirySource(request.getInquirySource());
        lead.setInterestedProduct(request.getInterestedProduct());
        lead.setInitialRequest(request.getInitialRequest());
        lead.setStatus(request.getStatus());
        lead.setNotes(request.getNotes());

        lead = leadRepository.save(lead);
        return leadMapper.toDto(lead);
    }

    @Transactional
    public LeadDTO assignLead(UUID id, LeadAssignRequest request) {
        Lead lead = leadRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Lead not found"));
        
        Employee assignee = employeeRepository.findById(request.getAssignedTo())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        
        lead.setAssignedTo(assignee);
        lead = leadRepository.save(lead);
        return leadMapper.toDto(lead);
    }

    @Transactional
    public void deleteLead(UUID id) {
        Lead lead = leadRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Lead not found"));
        if (!hasAuthority("LEAD_DELETE") && !hasAuthority("ROLE_SYSTEM_ADMIN")) {
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
}
