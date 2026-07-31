package com.knoweb.salesmanagement.projectbrief.service;

import com.knoweb.salesmanagement.employee.entity.Employee;
import com.knoweb.salesmanagement.notification.service.NotificationService;
import com.knoweb.salesmanagement.opportunity.entity.SalesOpportunity;
import com.knoweb.salesmanagement.projectbrief.entity.ProjectBrief;
import com.knoweb.salesmanagement.projectbrief.enums.ProjectBriefStatus;
import com.knoweb.salesmanagement.projectbrief.repository.ProjectBriefRepository;
import com.knoweb.salesmanagement.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectBriefDeadlineSchedulerTest {

    @Mock
    private ProjectBriefRepository projectBriefRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ProjectBriefDeadlineScheduler scheduler;

    private ProjectBrief overdueBrief;
    private User salesUser;

    @BeforeEach
    void setUp() {
        salesUser = new User();
        salesUser.setId(UUID.randomUUID());
        salesUser.setEmail("sales@knoweb.com");

        Employee salesOfficer = new Employee();
        salesOfficer.setId(UUID.randomUUID());
        salesOfficer.setUser(salesUser);

        SalesOpportunity opportunity = new SalesOpportunity();
        opportunity.setId(UUID.randomUUID());
        opportunity.setOpportunityNumber("OPP-2026-9999");
        opportunity.setAssignedSalesOfficer(salesOfficer);

        overdueBrief = new ProjectBrief();
        overdueBrief.setId(UUID.randomUUID());
        overdueBrief.setOpportunity(opportunity);
        overdueBrief.setStatus(ProjectBriefStatus.DRAFT);
        overdueBrief.setDueAt(OffsetDateTime.now().minusHours(2));
    }

    @Test
    void testCheckOverdueBriefs_SendsNotificationWithDeduplicationKey() {
        when(projectBriefRepository.findOverdueBriefs(eq(ProjectBriefStatus.DRAFT), any()))
                .thenReturn(Collections.singletonList(overdueBrief));

        scheduler.checkOverdueBriefs();

        verify(notificationService).createNotification(
                eq(salesUser),
                eq("PROJECT_BRIEF_OVERDUE"),
                contains("Overdue"),
                contains(overdueBrief.getOpportunity().getOpportunityNumber()),
                eq("PROJECT_BRIEF"),
                eq(overdueBrief.getId()),
                eq("OVERDUE_BRIEF_" + overdueBrief.getId().toString())
        );
    }

    @Test
    void testCheckOverdueBriefs_RepeatedExecutionUsesSameDeduplicationKey() {
        when(projectBriefRepository.findOverdueBriefs(eq(ProjectBriefStatus.DRAFT), any()))
                .thenReturn(Collections.singletonList(overdueBrief));

        // First run
        scheduler.checkOverdueBriefs();
        // Second run
        scheduler.checkOverdueBriefs();

        verify(notificationService, times(2)).createNotification(
                eq(salesUser),
                eq("PROJECT_BRIEF_OVERDUE"),
                anyString(),
                anyString(),
                eq("PROJECT_BRIEF"),
                eq(overdueBrief.getId()),
                eq("OVERDUE_BRIEF_" + overdueBrief.getId().toString())
        );
    }

    @Test
    void testCheckOverdueBriefs_NoOverdueBriefs() {
        when(projectBriefRepository.findOverdueBriefs(eq(ProjectBriefStatus.DRAFT), any()))
                .thenReturn(Collections.emptyList());

        scheduler.checkOverdueBriefs();

        verify(notificationService, never()).createNotification(any(), any(), any(), any(), any(), any(), any());
    }
}
