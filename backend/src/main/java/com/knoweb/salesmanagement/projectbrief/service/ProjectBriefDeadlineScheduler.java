package com.knoweb.salesmanagement.projectbrief.service;

import com.knoweb.salesmanagement.employee.entity.Employee;
import com.knoweb.salesmanagement.notification.service.NotificationService;
import com.knoweb.salesmanagement.projectbrief.entity.ProjectBrief;
import com.knoweb.salesmanagement.projectbrief.enums.ProjectBriefStatus;
import com.knoweb.salesmanagement.projectbrief.repository.ProjectBriefRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class ProjectBriefDeadlineScheduler {

    private static final Logger log = LoggerFactory.getLogger(ProjectBriefDeadlineScheduler.class);
    
    private final ProjectBriefRepository projectBriefRepository;
    private final NotificationService notificationService;

    public ProjectBriefDeadlineScheduler(ProjectBriefRepository projectBriefRepository,
                                         NotificationService notificationService) {
        this.projectBriefRepository = projectBriefRepository;
        this.notificationService = notificationService;
    }

    @Scheduled(fixedRateString = "${app.scheduling.deadline-check-rate:300000}") // Default 5 mins
    @Transactional
    public void checkOverdueBriefs() {
        OffsetDateTime now = OffsetDateTime.now();
        List<ProjectBrief> overdueBriefs = projectBriefRepository.findOverdueBriefs(ProjectBriefStatus.DRAFT, now);

        for (ProjectBrief brief : overdueBriefs) {
            String deduplicationKey = "OVERDUE_BRIEF_" + brief.getId().toString();
            Employee salesOfficer = brief.getOpportunity().getAssignedSalesOfficer();

            if (salesOfficer != null && salesOfficer.getUser() != null) {
                notificationService.createNotification(
                        salesOfficer.getUser(),
                        "PROJECT_BRIEF_OVERDUE",
                        "Project Brief Overdue",
                        "The project brief for opportunity " + brief.getOpportunity().getOpportunityNumber() + " is overdue.",
                        "PROJECT_BRIEF",
                        brief.getId(),
                        deduplicationKey
                );
            }
        }
        
        if (!overdueBriefs.isEmpty()) {
            log.info("Processed {} overdue project briefs.", overdueBriefs.size());
        }
    }
}
