package com.knoweb.salesmanagement.opportunity.service;

import com.knoweb.salesmanagement.client.entity.Client;
import com.knoweb.salesmanagement.client.entity.ClientContact;
import com.knoweb.salesmanagement.client.repository.ClientContactRepository;
import com.knoweb.salesmanagement.client.repository.ClientRepository;
import com.knoweb.salesmanagement.common.exception.ResourceNotFoundException;
import com.knoweb.salesmanagement.common.exception.ResourceConflictException;
import com.knoweb.salesmanagement.employee.entity.Employee;
import com.knoweb.salesmanagement.employee.repository.EmployeeRepository;
import com.knoweb.salesmanagement.lead.dto.ConvertLeadRequest;
import com.knoweb.salesmanagement.lead.entity.Lead;
import com.knoweb.salesmanagement.lead.enums.LeadStatus;
import com.knoweb.salesmanagement.lead.repository.LeadRepository;
import com.knoweb.salesmanagement.opportunity.dto.OpportunityActivityDTO;
import com.knoweb.salesmanagement.opportunity.dto.SalesOpportunityDTO;
import com.knoweb.salesmanagement.opportunity.dto.SalesOpportunitySummaryDTO;
import com.knoweb.salesmanagement.opportunity.entity.OpportunityActivity;
import com.knoweb.salesmanagement.opportunity.entity.SalesOpportunity;
import com.knoweb.salesmanagement.opportunity.enums.OpportunityStage;
import com.knoweb.salesmanagement.opportunity.repository.OpportunityActivityRepository;
import com.knoweb.salesmanagement.opportunity.repository.SalesOpportunityRepository;
import com.knoweb.salesmanagement.productcategory.entity.ProductCategory;
import com.knoweb.salesmanagement.productcategory.repository.ProductCategoryRepository;
import com.knoweb.salesmanagement.projectbrief.dto.ProjectBriefSummaryDTO;
import com.knoweb.salesmanagement.projectbrief.entity.ProjectBrief;
import com.knoweb.salesmanagement.projectbrief.enums.ProjectBriefStatus;
import com.knoweb.salesmanagement.projectbrief.repository.ProjectBriefRepository;
import com.knoweb.salesmanagement.projectbrief.util.ProjectBriefDeadlineUtil;
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
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SalesOpportunityService {

    private final SalesOpportunityRepository opportunityRepository;
    private final OpportunityActivityRepository activityRepository;
    private final LeadRepository leadRepository;
    private final ClientRepository clientRepository;
    private final ClientContactRepository clientContactRepository;
    private final EmployeeRepository employeeRepository;
    private final ProductCategoryRepository productCategoryRepository;
    private final UserRepository userRepository;
    private final ProjectBriefRepository projectBriefRepository;

    public SalesOpportunityService(SalesOpportunityRepository opportunityRepository,
                                   OpportunityActivityRepository activityRepository,
                                   LeadRepository leadRepository,
                                   ClientRepository clientRepository,
                                   ClientContactRepository clientContactRepository,
                                   EmployeeRepository employeeRepository,
                                   ProductCategoryRepository productCategoryRepository,
                                   UserRepository userRepository,
                                   ProjectBriefRepository projectBriefRepository) {
        this.opportunityRepository = opportunityRepository;
        this.activityRepository = activityRepository;
        this.leadRepository = leadRepository;
        this.clientRepository = clientRepository;
        this.clientContactRepository = clientContactRepository;
        this.employeeRepository = employeeRepository;
        this.productCategoryRepository = productCategoryRepository;
        this.userRepository = userRepository;
        this.projectBriefRepository = projectBriefRepository;
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

    private String generateOpportunityNumber() {
        long count = opportunityRepository.count() + 1;
        String prefix = "OPP-" + LocalDate.now().getYear() + "-";
        String number = String.format("%04d", count);
        while (opportunityRepository.existsByOpportunityNumber(prefix + number)) {
            count++;
            number = String.format("%04d", count);
        }
        return prefix + number;
    }

    private void validateAccess(SalesOpportunity opportunity) {
        if (hasAuthority("ROLE_SYSTEM_ADMIN") || hasAuthority("ROLE_BDM") || hasAuthority("ROLE_TOP_MANAGEMENT")) return;
        Employee currentEmployee = getCurrentEmployee();
        if (currentEmployee == null || opportunity.getAssignedSalesOfficer() == null || 
            !opportunity.getAssignedSalesOfficer().getId().equals(currentEmployee.getId())) {
            throw new AccessDeniedException("You do not have permission for this opportunity");
        }
    }

    @Transactional
    public SalesOpportunityDTO convertLeadToOpportunity(UUID leadId, ConvertLeadRequest request) {
        // OPPORTUNITY_CREATE is checked at controller level
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found"));

        if (!hasAuthority("ROLE_SYSTEM_ADMIN") && !hasAuthority("ROLE_BDM") && !hasAuthority("ROLE_TOP_MANAGEMENT")) {
            Employee currentEmployee = getCurrentEmployee();
            if (currentEmployee == null || lead.getAssignedTo() == null || !lead.getAssignedTo().getId().equals(currentEmployee.getId())) {
                throw new AccessDeniedException("You do not have permission to convert this lead");
            }
        }

        if (opportunityRepository.existsByLeadId(leadId)) {
            throw new ResourceConflictException("This lead has already been converted to an opportunity.");
        }

        ProductCategory category = productCategoryRepository.findById(request.getProductCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Product category not found"));

        Employee salesOfficer = employeeRepository.findById(request.getAssignedSalesOfficerId())
                .orElseThrow(() -> new ResourceNotFoundException("Sales officer not found"));

        SalesOpportunity opportunity = new SalesOpportunity();
        opportunity.setOpportunityNumber(generateOpportunityNumber());
        opportunity.setLead(lead);
        opportunity.setClient(lead.getClient());
        
        if (request.getPrimaryContactId() != null) {
            ClientContact contact = clientContactRepository.findById(request.getPrimaryContactId())
                    .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));
            opportunity.setPrimaryContact(contact);
        } else if (lead.getContact() != null) {
            opportunity.setPrimaryContact(lead.getContact());
        }

        opportunity.setTitle(request.getTitle());
        opportunity.setDescription(request.getDescription());
        opportunity.setProductCategory(category);
        opportunity.setAssignedSalesOfficer(salesOfficer);
        opportunity.setEstimatedValue(request.getEstimatedValue());
        opportunity.setCurrency(request.getCurrency() != null ? request.getCurrency() : "USD");
        opportunity.setProbabilityPercent(request.getProbabilityPercent() != null ? request.getProbabilityPercent() : 50);
        opportunity.setExpectedCloseDate(request.getExpectedCloseDate());
        opportunity.setStage(OpportunityStage.QUALIFIED);

        opportunity = opportunityRepository.save(opportunity);

        lead.setStatus(LeadStatus.QUALIFIED);
        if (request.getInitialMeetingAt() != null) {
            lead.setInitialMeetingAt(request.getInitialMeetingAt());
        }
        leadRepository.save(lead);

        logActivity(opportunity, "CONVERTED", "Lead converted to Sales Opportunity");

        return mapToDTO(opportunity);
    }

    @Transactional
    public void logActivity(SalesOpportunity opportunity, String type, String description) {
        OpportunityActivity activity = new OpportunityActivity();
        activity.setOpportunity(opportunity);
        activity.setActivityType(type);
        activity.setDescription(description);
        activity.setActivityDate(OffsetDateTime.now());
        activityRepository.save(activity);
    }

    @Transactional(readOnly = true)
    public Page<SalesOpportunitySummaryDTO> searchOpportunities(String search, OpportunityStage stage, UUID clientId, Pageable pageable) {
        UUID assignedToFilter = null;
        if (!hasAuthority("ROLE_SYSTEM_ADMIN") && !hasAuthority("ROLE_BDM") && !hasAuthority("ROLE_TOP_MANAGEMENT")) {
            Employee emp = getCurrentEmployee();
            if (emp != null) {
                assignedToFilter = emp.getId();
            } else {
                assignedToFilter = UUID.randomUUID(); // No results
            }
        }
        
        final UUID finalAssignedToFilter = assignedToFilter;

        Specification<SalesOpportunity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("title")), searchPattern),
                    cb.like(cb.lower(root.get("opportunityNumber")), searchPattern)
                ));
            }

            if (stage != null) {
                predicates.add(cb.equal(root.get("stage"), stage));
            }

            if (finalAssignedToFilter != null) {
                predicates.add(cb.equal(root.join("assignedSalesOfficer").get("id"), finalAssignedToFilter));
            }

            if (clientId != null) {
                predicates.add(cb.equal(root.join("client").get("id"), clientId));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return opportunityRepository.findAll(spec, pageable).map(this::mapToSummaryDTO);
    }

    @Transactional(readOnly = true)
    public SalesOpportunityDTO getOpportunity(UUID id) {
        SalesOpportunity opp = opportunityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found"));
        validateAccess(opp);
        return mapToDTO(opp);
    }

    private SalesOpportunitySummaryDTO mapToSummaryDTO(SalesOpportunity entity) {
        SalesOpportunitySummaryDTO dto = new SalesOpportunitySummaryDTO();
        dto.setId(entity.getId());
        dto.setOpportunityNumber(entity.getOpportunityNumber());
        dto.setTitle(entity.getTitle());
        dto.setClientName(entity.getClient().getName());
        dto.setProductCategoryName(entity.getProductCategory().getName());
        if (entity.getAssignedSalesOfficer() != null) {
            dto.setAssignedSalesOfficerName(entity.getAssignedSalesOfficer().getFirstName() + " " + entity.getAssignedSalesOfficer().getLastName());
        }
        dto.setEstimatedValue(entity.getEstimatedValue());
        dto.setCurrency(entity.getCurrency());
        dto.setProbabilityPercent(entity.getProbabilityPercent());
        dto.setStage(entity.getStage());
        dto.setCreatedAt(entity.getCreatedAt());

        Optional<ProjectBrief> briefOpt = projectBriefRepository.findByOpportunityId(entity.getId());
        ProjectBrief brief;
        if (briefOpt.isPresent()) {
            brief = briefOpt.get();
        } else {
            brief = new ProjectBrief();
            brief.setStatus(ProjectBriefStatus.DRAFT);
            OffsetDateTime initialMeeting = entity.getLead() != null ? entity.getLead().getInitialMeetingAt() : null;
            if (initialMeeting != null) {
                brief.setDueAt(initialMeeting.plusHours(24));
            } else {
                brief.setDueAt(entity.getCreatedAt() != null ? entity.getCreatedAt().plusHours(24) : OffsetDateTime.now().plusHours(24));
            }
        }
        
        ProjectBriefSummaryDTO briefDto = new ProjectBriefSummaryDTO();
        briefDto.setId(brief.getId());
        briefDto.setStatus(brief.getStatus());
        briefDto.setDueAt(brief.getDueAt());
        briefDto.setOverdue(ProjectBriefDeadlineUtil.isOverdue(brief));
        briefDto.setOverdueHours(ProjectBriefDeadlineUtil.calculateOverdueHours(brief));
        briefDto.setDeadlineStatus(ProjectBriefDeadlineUtil.calculateDeadlineStatus(brief));
        briefDto.setCurrentVersionNumber(brief.getCurrentVersionNumber());
        dto.setProjectBrief(briefDto);

        return dto;
    }

    private SalesOpportunityDTO mapToDTO(SalesOpportunity entity) {
        SalesOpportunityDTO dto = new SalesOpportunityDTO();
        dto.setId(entity.getId());
        dto.setOpportunityNumber(entity.getOpportunityNumber());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setEstimatedValue(entity.getEstimatedValue());
        dto.setCurrency(entity.getCurrency());
        dto.setProbabilityPercent(entity.getProbabilityPercent());
        dto.setExpectedCloseDate(entity.getExpectedCloseDate());
        dto.setStage(entity.getStage());
        dto.setOnHoldReason(entity.getOnHoldReason());
        dto.setLostReason(entity.getLostReason());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        // Basic client info
        if (entity.getAssignedSalesOfficer() != null) {
            dto.setAssignedSalesOfficerId(entity.getAssignedSalesOfficer().getId());
            dto.setAssignedSalesOfficerName(entity.getAssignedSalesOfficer().getFirstName() + " " + entity.getAssignedSalesOfficer().getLastName());
        }

        if (entity.getClient() != null) {
            dto.setClientId(entity.getClient().getId());
            dto.setClientName(entity.getClient().getName());
        }
        if (entity.getPrimaryContact() != null) {
            dto.setPrimaryContactId(entity.getPrimaryContact().getId());
            dto.setPrimaryContactName(entity.getPrimaryContact().getFirstName() + " " + entity.getPrimaryContact().getLastName());
        }
        if (entity.getProductCategory() != null) {
            dto.setProductCategoryId(entity.getProductCategory().getId());
            dto.setProductCategoryName(entity.getProductCategory().getName());
        }
        
        List<OpportunityActivityDTO> activityDTOs = activityRepository.findByOpportunityIdOrderByActivityDateDesc(entity.getId())
            .stream()
            .map(a -> {
                OpportunityActivityDTO actDto = new OpportunityActivityDTO();
                actDto.setId(a.getId());
                actDto.setActivityType(a.getActivityType());
                actDto.setDescription(a.getDescription());
                actDto.setCreatedAt(a.getActivityDate());
                actDto.setCreatedByName("System");
                return actDto;
            }).collect(java.util.stream.Collectors.toList());
        dto.setActivities(activityDTOs);
        
        Optional<ProjectBrief> briefOpt = projectBriefRepository.findByOpportunityId(entity.getId());
        ProjectBrief brief;
        if (briefOpt.isPresent()) {
            brief = briefOpt.get();
        } else {
            brief = new ProjectBrief();
            brief.setStatus(ProjectBriefStatus.DRAFT);
            OffsetDateTime initialMeeting = entity.getLead() != null ? entity.getLead().getInitialMeetingAt() : null;
            if (initialMeeting != null) {
                brief.setDueAt(initialMeeting.plusHours(24));
            } else {
                brief.setDueAt(entity.getCreatedAt() != null ? entity.getCreatedAt().plusHours(24) : OffsetDateTime.now().plusHours(24));
            }
        }
        
        ProjectBriefSummaryDTO briefDto = new ProjectBriefSummaryDTO();
        briefDto.setId(brief.getId());
        briefDto.setStatus(brief.getStatus());
        briefDto.setDueAt(brief.getDueAt());
        briefDto.setOverdue(ProjectBriefDeadlineUtil.isOverdue(brief));
        briefDto.setOverdueHours(ProjectBriefDeadlineUtil.calculateOverdueHours(brief));
        briefDto.setDeadlineStatus(ProjectBriefDeadlineUtil.calculateDeadlineStatus(brief));
        briefDto.setCurrentVersionNumber(brief.getCurrentVersionNumber());
        dto.setProjectBrief(briefDto);
        
        return dto;
    }
}
