package com.knoweb.salesmanagement.projectbrief.service;

import com.knoweb.salesmanagement.common.exception.ResourceConflictException;
import com.knoweb.salesmanagement.common.exception.ResourceNotFoundException;
import com.knoweb.salesmanagement.department.entity.Department;
import com.knoweb.salesmanagement.department.repository.DepartmentRepository;
import com.knoweb.salesmanagement.employee.entity.Employee;
import com.knoweb.salesmanagement.employee.repository.EmployeeRepository;
import com.knoweb.salesmanagement.notification.service.NotificationService;
import com.knoweb.salesmanagement.opportunity.entity.SalesOpportunity;
import com.knoweb.salesmanagement.opportunity.enums.OpportunityStage;
import com.knoweb.salesmanagement.opportunity.repository.SalesOpportunityRepository;
import com.knoweb.salesmanagement.opportunity.service.SalesOpportunityService;
import com.knoweb.salesmanagement.projectbrief.dto.ProjectBriefDTO;
import com.knoweb.salesmanagement.projectbrief.dto.ProjectBriefSubmitRequest;
import com.knoweb.salesmanagement.projectbrief.dto.ProjectBriefUpdateDraftRequest;
import com.knoweb.salesmanagement.projectbrief.entity.ProjectBrief;
import com.knoweb.salesmanagement.projectbrief.entity.ProjectBriefAttachment;
import com.knoweb.salesmanagement.projectbrief.enums.ProjectBriefStatus;
import com.knoweb.salesmanagement.projectbrief.repository.ProjectBriefAttachmentRepository;
import com.knoweb.salesmanagement.projectbrief.repository.ProjectBriefRepository;
import com.knoweb.salesmanagement.projectbrief.repository.ProjectBriefVersionRepository;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import com.knoweb.salesmanagement.approval.service.WorkflowTransitionService;
import tools.jackson.databind.json.JsonMapper;
import com.knoweb.salesmanagement.common.exception.ProjectBriefSnapshotException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectBriefServiceTest {

    @Mock
    private ProjectBriefRepository projectBriefRepository;
    @Mock
    private ProjectBriefVersionRepository versionRepository;
    @Mock
    private ProjectBriefAttachmentRepository attachmentRepository;
    @Mock
    private SalesOpportunityRepository opportunityRepository;
    @Mock
    private DepartmentRepository departmentRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private SalesOpportunityService opportunityService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private WorkflowTransitionService workflowTransitionService;
    @Mock
    private JsonMapper jsonMapper;
    @Mock
    private com.knoweb.salesmanagement.approval.repository.BdmApprovalRepository bdmApprovalRepository;

    @InjectMocks
    private ProjectBriefService projectBriefService;

    private UUID briefId;
    private ProjectBrief draftBrief;
    private SalesOpportunity opportunity;
    private User adminUser;
    private Department department;

    @BeforeEach
    void setUp() {
        briefId = UUID.randomUUID();
        
        adminUser = new User();
        adminUser.setId(UUID.randomUUID());
        adminUser.setEmail("admin@knoweb.com");

        opportunity = new SalesOpportunity();
        opportunity.setId(UUID.randomUUID());
        opportunity.setOpportunityNumber("OPP-2026-0001");
        opportunity.setTitle("Test Opportunity");
        opportunity.setStage(OpportunityStage.BRIEF_IN_PROGRESS);

        department = new Department();
        department.setId(UUID.randomUUID());
        department.setName("Engineering");

        draftBrief = new ProjectBrief();
        draftBrief.setId(briefId);
        draftBrief.setOpportunity(opportunity);
        draftBrief.setStatus(ProjectBriefStatus.DRAFT);
        draftBrief.setCurrentVersionNumber(1);
        draftBrief.setDueAt(OffsetDateTime.now().plusHours(24));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("admin@knoweb.com", "password", java.util.Arrays.asList(new SimpleGrantedAuthority("ROLE_SYSTEM_ADMIN"), new SimpleGrantedAuthority("PROJECT_BRIEF_UPDATE"), new SimpleGrantedAuthority("PROJECT_BRIEF_READ")))
        );
    }

    @Test
    void testSaveDraft_DoesNotSendSubmissionNotification() throws Exception {
        when(projectBriefRepository.findById(briefId)).thenReturn(Optional.of(draftBrief));
        when(projectBriefRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ProjectBriefUpdateDraftRequest request = new ProjectBriefUpdateDraftRequest();
        request.setProjectTitle("Updated Title");

        ProjectBriefDTO result = projectBriefService.updateDraft(briefId, request);

        assertNotNull(result);
        verify(notificationService, never()).createNotification(any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    void testSaveVersion_DoesNotSendSubmissionNotification() throws Exception {
        when(projectBriefRepository.findById(briefId)).thenReturn(Optional.of(draftBrief));
        when(projectBriefRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(adminUser));
        when(jsonMapper.writeValueAsString(any())).thenReturn("{\"snapshot\": true}");

        ProjectBriefUpdateDraftRequest request = new ProjectBriefUpdateDraftRequest();
        request.setProjectTitle("Version Title");
        request.setChangeSummary("Initial Version");

        ProjectBriefDTO result = projectBriefService.saveVersion(briefId, request);

        assertNotNull(result);
        verify(versionRepository).saveAndFlush(any());
        verify(notificationService, never()).createNotification(any(), eq("PROJECT_BRIEF_SUBMITTED"), any(), any(), any(), any(), any());
    }

    @Test
    void testSubmitProjectBrief_SendsNotificationToBDMWithDeduplicationKey() throws Exception {
        draftBrief.setProjectTitle("Complete Brief");
        draftBrief.setBusinessProblem("Problem statement");
        draftBrief.setRequiredSolution("Solution description");
        draftBrief.setProjectScope("Full scope");
        draftBrief.setTechnicalRequirements("Java 21, PostgreSQL");
        draftBrief.setExpectedBudget(new BigDecimal("50000.00"));
        draftBrief.setExpectedDeadline(LocalDate.now().plusMonths(3));
        draftBrief.getRequiredDepartments().add(department);

        User bdmUser = new User();
        bdmUser.setId(UUID.randomUUID());
        bdmUser.setEmail("bdm@knoweb.com");

        when(projectBriefRepository.findById(briefId)).thenReturn(Optional.of(draftBrief));
        when(projectBriefRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(adminUser));
        when(userRepository.findByRolesCode("BDM")).thenReturn(Collections.singletonList(bdmUser));
        when(jsonMapper.writeValueAsString(any())).thenReturn("{\"snapshot\": true}");
        
        doAnswer(inv -> {
            ProjectBrief b = inv.getArgument(0);
            b.setStatus(ProjectBriefStatus.AWAITING_BDM_REVIEW);
            return null;
        }).when(workflowTransitionService).submitProjectBrief(any(), any());

        ProjectBriefSubmitRequest request = new ProjectBriefSubmitRequest();
        request.setVersionNumber(1);

        ProjectBriefDTO result = projectBriefService.submitProjectBrief(briefId, request);

        assertEquals(ProjectBriefStatus.AWAITING_BDM_REVIEW, result.getStatus());
        verify(notificationService).createNotification(
                eq(bdmUser),
                eq("PROJECT_BRIEF_SUBMITTED"),
                contains("Submitted"),
                contains(opportunity.getOpportunityNumber()),
                eq("PROJECT_BRIEF"),
                eq(briefId),
                eq("PB_SUBMITTED_" + briefId.toString())
        );
    }

    @Test
    void testSubmitProjectBrief_FailsWhenMandatoryFieldsAreMissing() {
        draftBrief.setProjectTitle(null); // Missing title

        when(projectBriefRepository.findById(briefId)).thenReturn(Optional.of(draftBrief));

        ProjectBriefSubmitRequest request = new ProjectBriefSubmitRequest();
        request.setVersionNumber(1);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                projectBriefService.submitProjectBrief(briefId, request)
        );

        assertTrue(ex.getMessage().contains("Mandatory fields missing"));
        verify(projectBriefRepository, never()).save(any());
    }

    @Test
    void testUpdateDraft_FailsOnSubmittedBrief() {
        draftBrief.setStatus(ProjectBriefStatus.SUBMITTED);
        when(projectBriefRepository.findById(briefId)).thenReturn(Optional.of(draftBrief));

        ProjectBriefUpdateDraftRequest request = new ProjectBriefUpdateDraftRequest();
        request.setProjectTitle("Test");

        assertThrows(ResourceConflictException.class, () ->
                projectBriefService.updateDraft(briefId, request)
        );
    }

    @Test
    void testSaveVersion_FailsOnSubmittedBrief() {
        draftBrief.setStatus(ProjectBriefStatus.SUBMITTED);
        when(projectBriefRepository.findById(briefId)).thenReturn(Optional.of(draftBrief));

        ProjectBriefUpdateDraftRequest request = new ProjectBriefUpdateDraftRequest();

        assertThrows(ResourceConflictException.class, () ->
                projectBriefService.saveVersion(briefId, request)
        );
    }

    @Test
    void testUpdateDraft_FailsOnStaleVersion() {
        draftBrief.setCurrentVersionNumber(5);
        when(projectBriefRepository.findById(briefId)).thenReturn(Optional.of(draftBrief));

        ProjectBriefUpdateDraftRequest request = new ProjectBriefUpdateDraftRequest();
        request.setVersionNumber(4); // Stale version!

        assertThrows(ResourceConflictException.class, () ->
                projectBriefService.updateDraft(briefId, request)
        );
    }

    @Test
    void testSaveVersion_ThrowsConflictOnDuplicateVersion() throws Exception {
        when(projectBriefRepository.findById(briefId)).thenReturn(Optional.of(draftBrief));
        when(projectBriefRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(adminUser));
        when(jsonMapper.writeValueAsString(any())).thenReturn("{\"snapshot\": true}");
        
        doThrow(new org.springframework.dao.DataIntegrityViolationException("Constraint violation"))
            .when(versionRepository).saveAndFlush(any());

        ProjectBriefUpdateDraftRequest request = new ProjectBriefUpdateDraftRequest();

        ResourceConflictException ex = assertThrows(ResourceConflictException.class, () ->
                projectBriefService.saveVersion(briefId, request)
        );
        assertTrue(ex.getMessage().contains("Version conflict"));
    }

    @Test
    void testSaveVersion_FailsOnSerialization() throws Exception {
        when(projectBriefRepository.findById(briefId)).thenReturn(Optional.of(draftBrief));
        when(projectBriefRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(adminUser));
        when(jsonMapper.writeValueAsString(any())).thenThrow(new tools.jackson.core.JacksonException("Serialization failed") {});

        ProjectBriefUpdateDraftRequest request = new ProjectBriefUpdateDraftRequest();

        ProjectBriefSnapshotException ex = assertThrows(ProjectBriefSnapshotException.class, () ->
                projectBriefService.saveVersion(briefId, request)
        );
        assertTrue(ex.getMessage().contains("Failed to serialize project brief snapshot"));
        verify(versionRepository, never()).saveAndFlush(any());
    }

    @Test
    void testSubmitProjectBrief_FailsOnSubmittedBrief() {
        draftBrief.setStatus(ProjectBriefStatus.SUBMITTED);
        when(projectBriefRepository.findById(briefId)).thenReturn(Optional.of(draftBrief));

        ProjectBriefSubmitRequest request = new ProjectBriefSubmitRequest();

        assertThrows(ResourceConflictException.class, () ->
                projectBriefService.submitProjectBrief(briefId, request)
        );
    }

    @Test
    void testUpdateDraft_SucceedsWhenReturnedForRevision() {
        draftBrief.setStatus(ProjectBriefStatus.BDM_RETURNED_FOR_REVISION);
        when(projectBriefRepository.findById(briefId)).thenReturn(Optional.of(draftBrief));
        when(projectBriefRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ProjectBriefUpdateDraftRequest request = new ProjectBriefUpdateDraftRequest();
        request.setProjectTitle("Revised Title");

        ProjectBriefDTO result = projectBriefService.updateDraft(briefId, request);
        assertNotNull(result);
        assertEquals("Revised Title", result.getProjectTitle());
    }

    @Test
    void testUploadAttachment_Success() throws Exception {
        when(projectBriefRepository.findById(briefId)).thenReturn(Optional.of(draftBrief));
        when(attachmentRepository.save(any())).thenAnswer(inv -> {
            ProjectBriefAttachment att = inv.getArgument(0);
            if (att.getId() == null) att.setId(UUID.randomUUID());
            return att;
        });

        MockMultipartFile file = new MockMultipartFile(
                "file", "architecture_diagram.png", "image/png", "png content".getBytes()
        );

        var dto = projectBriefService.uploadAttachment(briefId, file);

        assertNotNull(dto);
        assertEquals("architecture_diagram.png", dto.getFileName());
        verify(attachmentRepository, times(2)).save(any());
    }

    @Test
    void testUploadAttachment_RejectsInvalidPathSequence() {
        when(projectBriefRepository.findById(briefId)).thenReturn(Optional.of(draftBrief));

        MockMultipartFile file = new MockMultipartFile(
                "file", "../etc/passwd", "image/png", "data".getBytes()
        );

        assertThrows(IllegalArgumentException.class, () ->
                projectBriefService.uploadAttachment(briefId, file)
        );
    }

    @Test
    void testUploadAttachment_RejectsInvalidFileType() {
        when(projectBriefRepository.findById(briefId)).thenReturn(Optional.of(draftBrief));

        MockMultipartFile file = new MockMultipartFile(
                "file", "malicious_script.exe", "application/x-msdownload", "executable".getBytes()
        );

        assertThrows(IllegalArgumentException.class, () ->
                projectBriefService.uploadAttachment(briefId, file)
        );
    }

    @Test
    void testUploadAttachment_RejectsSubmittedBrief() {
        draftBrief.setStatus(ProjectBriefStatus.SUBMITTED);
        when(projectBriefRepository.findById(briefId)).thenReturn(Optional.of(draftBrief));

        MockMultipartFile file = new MockMultipartFile(
                "file", "doc.pdf", "application/pdf", "pdf data".getBytes()
        );

        assertThrows(ResourceConflictException.class, () ->
                projectBriefService.uploadAttachment(briefId, file)
        );
    }

    @Test
    void testDeleteAttachment_RejectsSubmittedBrief() {
        draftBrief.setStatus(ProjectBriefStatus.SUBMITTED);
        when(projectBriefRepository.findById(briefId)).thenReturn(Optional.of(draftBrief));

        assertThrows(ResourceConflictException.class, () ->
                projectBriefService.deleteAttachment(briefId, UUID.randomUUID())
        );
    }
}
