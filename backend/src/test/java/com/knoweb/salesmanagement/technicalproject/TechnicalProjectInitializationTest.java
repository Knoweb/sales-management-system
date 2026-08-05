package com.knoweb.salesmanagement.technicalproject;

import com.knoweb.salesmanagement.opportunity.entity.SalesOpportunity;
import com.knoweb.salesmanagement.opportunity.enums.OpportunityStage;
import com.knoweb.salesmanagement.opportunity.repository.SalesOpportunityRepository;
import com.knoweb.salesmanagement.projectbrief.entity.ProjectBrief;
import com.knoweb.salesmanagement.projectbrief.repository.ProjectBriefRepository;
import com.knoweb.salesmanagement.technicalproject.entity.TechnicalProject;
import com.knoweb.salesmanagement.technicalproject.service.TechnicalProjectInitializationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.List;
import java.util.Optional;

@SpringBootTest
public class TechnicalProjectInitializationTest {

    @Autowired
    private TechnicalProjectInitializationService initializationService;

    @Autowired
    private SalesOpportunityRepository opportunityRepository;

    @Autowired
    private ProjectBriefRepository projectBriefRepository;

    @Test
    @WithMockUser(username = "admin@test.com")
    public void testInitialization() {
        System.out.println("==================================================");
        System.out.println("TESTING INITIALIZATION");
        
        List<SalesOpportunity> routingOpps = opportunityRepository.findAll().stream()
                .filter(o -> OpportunityStage.READY_FOR_TECHNICAL_ROUTING.equals(o.getStage()))
                .toList();
        
        if (routingOpps.isEmpty()) {
            System.out.println("No eligible briefs found.");
            return;
        }
        
        SalesOpportunity opp = routingOpps.get(0);
        ProjectBrief pb = projectBriefRepository.findByOpportunityId(opp.getId()).orElseThrow();
        System.out.println("Initializing for PB ID: " + pb.getId());

        try {
            TechnicalProject project = initializationService.initializeTechnicalProject(pb.getId());
            System.out.println("SUCCESS! Created Technical Project: " + project.getId());
        } catch (Exception e) {
            System.out.println("FAILED FIRST INITIALIZATION WITH EXCEPTION:");
            e.printStackTrace();
        }

        System.out.println("TESTING DUPLICATE INITIALIZATION...");
        try {
            initializationService.initializeTechnicalProject(pb.getId());
            System.out.println("FAILED! Duplicate initialization succeeded but should have thrown 409/conflict!");
        } catch (com.knoweb.salesmanagement.technicalproject.exception.TechnicalProjectAlreadyExistsException e) {
            System.out.println("SUCCESS! Duplicate initialization correctly threw TechnicalProjectAlreadyExistsException (409).");
        } catch (Exception e) {
            System.out.println("FAILED! Threw wrong exception for duplicate:");
            e.printStackTrace();
        }
        
        System.out.println("==================================================");
    }
}
