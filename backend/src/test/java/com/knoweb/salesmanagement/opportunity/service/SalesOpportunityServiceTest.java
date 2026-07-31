package com.knoweb.salesmanagement.opportunity.service;

import com.knoweb.salesmanagement.client.entity.Client;
import com.knoweb.salesmanagement.client.repository.ClientRepository;
import com.knoweb.salesmanagement.common.exception.ResourceConflictException;
import com.knoweb.salesmanagement.common.exception.ResourceNotFoundException;
import com.knoweb.salesmanagement.employee.entity.Employee;
import com.knoweb.salesmanagement.employee.repository.EmployeeRepository;
import com.knoweb.salesmanagement.lead.dto.ConvertLeadRequest;
import com.knoweb.salesmanagement.lead.entity.Lead;
import com.knoweb.salesmanagement.lead.enums.LeadStatus;
import com.knoweb.salesmanagement.lead.repository.LeadRepository;
import com.knoweb.salesmanagement.opportunity.dto.SalesOpportunityDTO;
import com.knoweb.salesmanagement.opportunity.entity.SalesOpportunity;
import com.knoweb.salesmanagement.opportunity.enums.OpportunityStage;
import com.knoweb.salesmanagement.opportunity.repository.OpportunityActivityRepository;
import com.knoweb.salesmanagement.opportunity.repository.SalesOpportunityRepository;
import com.knoweb.salesmanagement.productcategory.entity.ProductCategory;
import com.knoweb.salesmanagement.productcategory.repository.ProductCategoryRepository;
import com.knoweb.salesmanagement.projectbrief.repository.ProjectBriefRepository;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SalesOpportunityServiceTest {

    @Mock
    private SalesOpportunityRepository opportunityRepository;
    @Mock
    private OpportunityActivityRepository activityRepository;
    @Mock
    private LeadRepository leadRepository;
    @Mock
    private ClientRepository clientRepository;
    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private ProductCategoryRepository productCategoryRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ProjectBriefRepository projectBriefRepository;

    @InjectMocks
    private SalesOpportunityService opportunityService;

    private UUID leadId;
    private Lead lead;
    private ProductCategory category;
    private Employee salesOfficer;

    @BeforeEach
    void setUp() {
        leadId = UUID.randomUUID();
        
        Client client = new Client();
        client.setId(UUID.randomUUID());
        client.setName("Acme Corp");

        lead = new Lead();
        lead.setId(leadId);
        lead.setClient(client);
        lead.setStatus(LeadStatus.NEW);

        category = new ProductCategory();
        category.setId(UUID.randomUUID());
        category.setName("Custom Software");

        salesOfficer = new Employee();
        salesOfficer.setId(UUID.randomUUID());

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("admin@knoweb.com", "password", Collections.singletonList(new SimpleGrantedAuthority("ROLE_SYSTEM_ADMIN")))
        );
    }

    @Test
    void testConvertLeadToOpportunity_Success() {
        when(leadRepository.findById(leadId)).thenReturn(Optional.of(lead));
        when(opportunityRepository.existsByLeadId(leadId)).thenReturn(false);
        when(productCategoryRepository.findById(category.getId())).thenReturn(Optional.of(category));
        when(employeeRepository.findById(salesOfficer.getId())).thenReturn(Optional.of(salesOfficer));
        when(opportunityRepository.save(any())).thenAnswer(inv -> {
            SalesOpportunity opp = inv.getArgument(0);
            opp.setId(UUID.randomUUID());
            return opp;
        });

        ConvertLeadRequest request = new ConvertLeadRequest();
        request.setTitle("Big Software Deal");
        request.setProductCategoryId(category.getId());
        request.setAssignedSalesOfficerId(salesOfficer.getId());
        request.setEstimatedValue(new BigDecimal("100000.00"));
        request.setExpectedCloseDate(LocalDate.now().plusMonths(2));

        SalesOpportunityDTO result = opportunityService.convertLeadToOpportunity(leadId, request);

        assertNotNull(result);
        assertEquals("Big Software Deal", result.getTitle());
        assertEquals(LeadStatus.QUALIFIED, lead.getStatus());
        verify(opportunityRepository).save(any());
        verify(projectBriefRepository).save(any());
    }

    @Test
    void testConvertLeadToOpportunity_RejectsDuplicateConversion() {
        when(leadRepository.findById(leadId)).thenReturn(Optional.of(lead));
        when(opportunityRepository.existsByLeadId(leadId)).thenReturn(true);

        ConvertLeadRequest request = new ConvertLeadRequest();
        request.setTitle("Duplicate Conversion");

        assertThrows(ResourceConflictException.class, () ->
                opportunityService.convertLeadToOpportunity(leadId, request)
        );

        verify(opportunityRepository, never()).save(any());
    }
}
