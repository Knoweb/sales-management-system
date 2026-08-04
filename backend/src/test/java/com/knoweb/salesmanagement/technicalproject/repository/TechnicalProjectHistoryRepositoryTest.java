package com.knoweb.salesmanagement.technicalproject.repository;

import com.knoweb.salesmanagement.client.entity.Client;
import com.knoweb.salesmanagement.client.enums.ClientType;
import com.knoweb.salesmanagement.client.repository.ClientRepository;
import com.knoweb.salesmanagement.lead.entity.Lead;
import com.knoweb.salesmanagement.lead.enums.InquirySource;
import com.knoweb.salesmanagement.lead.enums.LeadStatus;
import com.knoweb.salesmanagement.lead.repository.LeadRepository;
import com.knoweb.salesmanagement.opportunity.entity.SalesOpportunity;
import com.knoweb.salesmanagement.opportunity.repository.SalesOpportunityRepository;
import com.knoweb.salesmanagement.productcategory.entity.ProductCategory;
import com.knoweb.salesmanagement.productcategory.repository.ProductCategoryRepository;
import com.knoweb.salesmanagement.projectbrief.entity.ProjectBrief;
import com.knoweb.salesmanagement.projectbrief.enums.ProjectBriefStatus;
import com.knoweb.salesmanagement.projectbrief.repository.ProjectBriefRepository;
import com.knoweb.salesmanagement.technicalproject.entity.TechnicalProject;
import com.knoweb.salesmanagement.technicalproject.entity.TechnicalProjectHistory;
import com.knoweb.salesmanagement.technicalproject.enums.TechnicalProjectHistoryAction;
import com.knoweb.salesmanagement.technicalproject.enums.TechnicalProjectStatus;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class TechnicalProjectHistoryRepositoryTest {

    @Autowired private TechnicalProjectHistoryRepository historyRepository;
    @Autowired private TechnicalProjectRepository projectRepository;
    
    @Autowired private UserRepository userRepository;
    @Autowired private ClientRepository clientRepository;
    @Autowired private LeadRepository leadRepository;
    @Autowired private ProductCategoryRepository categoryRepository;
    @Autowired private SalesOpportunityRepository opportunityRepository;
    @Autowired private ProjectBriefRepository briefRepository;

    private User admin;
    private TechnicalProject tp;

    @BeforeEach
    public void setup() {
        admin = new User();
        admin.setEmail("admin_" + UUID.randomUUID() + "@test.com");
        admin.setFirstName("Admin");
        admin.setLastName("Test");
        admin.setPasswordHash("pass");
        admin = userRepository.save(admin);

        Client client = new Client();
        client.setName("Test Client Co");
        client.setClientType(ClientType.COMPANY);
        client = clientRepository.save(client);

        Lead lead = new Lead();
        lead.setTitle("Test Lead");
        lead.setClient(client);
        lead.setInquirySource(InquirySource.WEBSITE);
        lead.setStatus(LeadStatus.NEW);
        lead = leadRepository.save(lead);

        ProductCategory category = new ProductCategory();
        category.setCode("CAT-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        category.setName("Category");
        category = categoryRepository.save(category);

        SalesOpportunity opportunity = new SalesOpportunity();
        opportunity.setOpportunityNumber("OPP-" + UUID.randomUUID().toString().substring(0, 8));
        opportunity.setTitle("Test Opp");
        opportunity.setClient(client);
        opportunity.setLead(lead);
        opportunity.setProductCategory(category);
        opportunity.setStage(com.knoweb.salesmanagement.opportunity.enums.OpportunityStage.QUALIFIED);
        opportunity.setEstimatedValue(BigDecimal.valueOf(10000));
        opportunity.setExpectedCloseDate(LocalDate.now().plusDays(30));
        opportunity = opportunityRepository.save(opportunity);

        ProjectBrief brief = new ProjectBrief();
        brief.setOpportunity(opportunity);
        brief.setStatus(ProjectBriefStatus.DRAFT);
        brief.setProjectTitle("Test Title");
        brief.setBusinessProblem("Problem");
        brief.setRequiredSolution("Solution");
        brief.setProjectScope("Scope");
        brief.setTechnicalRequirements("Tech");
        brief.setExpectedBudget(BigDecimal.valueOf(1000));
        brief.setCurrency("USD");
        brief.setDueAt(OffsetDateTime.now().plusDays(1));
        brief.setExpectedDeadline(LocalDate.now().plusDays(10));
        brief = briefRepository.save(brief);

        tp = new TechnicalProject();
        tp.setProjectCode("TP-" + UUID.randomUUID().toString().substring(0, 8));
        tp.setProjectBrief(brief);
        tp.setStatus(TechnicalProjectStatus.AWAITING_TECHNICAL_ROUTING);
        tp = projectRepository.save(tp);
    }

    @Test
    public void testSaveHistoryEntry() {
        TechnicalProjectHistory history = new TechnicalProjectHistory();
        history.setTechnicalProject(tp);
        history.setEntityType("TechnicalProject");
        history.setEntityId(tp.getId());
        history.setAction(TechnicalProjectHistoryAction.TECHNICAL_PROJECT_CREATED);
        history.setPreviousValue("{\"status\": null}");
        history.setNewValue("{\"status\": \"AWAITING_TECHNICAL_ROUTING\"}");
        history.setReason("Initial creation");
        history.setActedBy(admin);
        
        history = historyRepository.saveAndFlush(history);
        
        assertNotNull(history.getId());
        assertNotNull(history.getActedAt());
        assertEquals(TechnicalProjectHistoryAction.TECHNICAL_PROJECT_CREATED, history.getAction());
        assertEquals("{\"status\": null}", history.getPreviousValue());
        
        List<TechnicalProjectHistory> fetched = historyRepository.findByTechnicalProjectIdOrderByActedAtDesc(tp.getId());
        assertEquals(1, fetched.size());
        assertEquals(history.getId(), fetched.get(0).getId());
    }
}
