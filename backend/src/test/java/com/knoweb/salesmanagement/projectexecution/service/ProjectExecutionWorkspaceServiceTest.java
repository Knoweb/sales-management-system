package com.knoweb.salesmanagement.projectexecution.service;

import com.knoweb.salesmanagement.costing.entity.ConsolidatedTechnicalEstimate;
import com.knoweb.salesmanagement.costing.repository.ConsolidatedTechnicalEstimateRepository;
import com.knoweb.salesmanagement.projectexecution.dto.ExecutionWorkspaceDTO;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectExecutionWorkspace;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectExecutionWorkspaceRepository;
import com.knoweb.salesmanagement.quotation.entity.Quotation;
import com.knoweb.salesmanagement.quotation.enums.QuotationStatus;
import com.knoweb.salesmanagement.quotation.repository.QuotationRepository;
import com.knoweb.salesmanagement.technicalproject.entity.TechnicalProject;
import com.knoweb.salesmanagement.technicalproject.repository.TechnicalProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class ProjectExecutionWorkspaceServiceTest {

    @Mock
    private ProjectExecutionWorkspaceRepository workspaceRepository;
    @Mock
    private TechnicalProjectRepository technicalProjectRepository;
    @Mock
    private QuotationRepository quotationRepository;
    @Mock
    private ConsolidatedTechnicalEstimateRepository estimateRepository;

    @InjectMocks
    private ProjectExecutionWorkspaceService workspaceService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createWorkspace_Success_WhenQuotationIsAccepted() {
        UUID projectId = UUID.randomUUID();
        TechnicalProject project = new TechnicalProject();
        project.setId(projectId);
        project.setVersion(1);

        UUID estimateId = UUID.randomUUID();
        ConsolidatedTechnicalEstimate estimate = new ConsolidatedTechnicalEstimate();
        estimate.setId(estimateId);
        estimate.setTechnicalProject(project);

        Quotation quotation = new Quotation();
        quotation.setApprovedEstimateId(estimateId);
        quotation.setStatus(QuotationStatus.CLIENT_ACCEPTED);

        when(workspaceRepository.findByTechnicalProjectId(projectId)).thenReturn(Optional.empty());
        when(technicalProjectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(estimateRepository.findByTechnicalProjectIdAndVersionNumber(projectId, 1)).thenReturn(Optional.of(estimate));
        when(quotationRepository.findAll()).thenReturn(List.of(quotation));
        when(workspaceRepository.save(any())).thenAnswer(i -> {
            ProjectExecutionWorkspace w = i.getArgument(0);
            w.setId(UUID.randomUUID());
            return w;
        });

        ExecutionWorkspaceDTO result = workspaceService.createWorkspace(projectId, null);
        assertNotNull(result);
        assertEquals(projectId, result.getTechnicalProjectId());
    }

    @Test
    void createWorkspace_ThrowsException_WhenNoAcceptedQuotation() {
        UUID projectId = UUID.randomUUID();
        TechnicalProject project = new TechnicalProject();
        project.setId(projectId);
        project.setVersion(1);

        UUID estimateId = UUID.randomUUID();
        ConsolidatedTechnicalEstimate estimate = new ConsolidatedTechnicalEstimate();
        estimate.setId(estimateId);
        estimate.setTechnicalProject(project);

        Quotation quotation = new Quotation();
        quotation.setApprovedEstimateId(estimateId);
        quotation.setStatus(QuotationStatus.PENDING_CLIENT_APPROVAL);

        when(workspaceRepository.findByTechnicalProjectId(projectId)).thenReturn(Optional.empty());
        when(technicalProjectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(estimateRepository.findByTechnicalProjectIdAndVersionNumber(projectId, 1)).thenReturn(Optional.of(estimate));
        when(quotationRepository.findAll()).thenReturn(List.of(quotation));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            workspaceService.createWorkspace(projectId, null);
        });

        assertTrue(exception.getMessage().contains("Project does not have a client accepted quotation"));
    }

    @Test
    void getAllWorkspaces_ReturnsDTOs_WithProjectCode() {
        TechnicalProject project = new TechnicalProject();
        project.setId(UUID.randomUUID());
        project.setProjectCode("PRJ-123");

        ProjectExecutionWorkspace workspace = new ProjectExecutionWorkspace();
        workspace.setId(UUID.randomUUID());
        workspace.setTechnicalProject(project);

        ProjectExecutionWorkspace workspace2 = new ProjectExecutionWorkspace();
        workspace2.setId(UUID.randomUUID());
        workspace2.setTechnicalProject(project);

        when(workspaceRepository.findAll()).thenReturn(List.of(workspace, workspace2));

        List<ExecutionWorkspaceDTO> dtos = workspaceService.getAllWorkspaces();
        assertEquals(2, dtos.size());
        assertEquals("PRJ-123", dtos.get(0).getProjectCode());
        assertEquals("PRJ-123", dtos.get(1).getProjectCode());
    }

    @Test
    void getWorkspaceById_HandlesNullableProjectManager() {
        TechnicalProject project = new TechnicalProject();
        project.setId(UUID.randomUUID());
        project.setProjectCode("PRJ-NULL-PM");

        ProjectExecutionWorkspace workspace = new ProjectExecutionWorkspace();
        workspace.setId(UUID.randomUUID());
        workspace.setTechnicalProject(project);
        workspace.setProjectManager(null); // Explicitly null

        when(workspaceRepository.findById(workspace.getId())).thenReturn(Optional.of(workspace));

        ExecutionWorkspaceDTO dto = workspaceService.getWorkspaceById(workspace.getId());
        assertNotNull(dto);
        assertEquals("PRJ-NULL-PM", dto.getProjectCode());
        assertNull(dto.getProjectManagerId());
        assertNull(dto.getProjectManagerName());
    }
}
