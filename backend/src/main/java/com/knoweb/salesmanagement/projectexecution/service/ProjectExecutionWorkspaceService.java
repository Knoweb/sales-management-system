package com.knoweb.salesmanagement.projectexecution.service;

import com.knoweb.salesmanagement.costing.entity.ConsolidatedTechnicalEstimate;
import com.knoweb.salesmanagement.costing.repository.ConsolidatedTechnicalEstimateRepository;
import com.knoweb.salesmanagement.projectexecution.dto.ExecutionWorkspaceDTO;
import com.knoweb.salesmanagement.projectexecution.dto.SetupWorkspaceDTO;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectExecutionWorkspace;
import com.knoweb.salesmanagement.projectexecution.enums.ExecutionWorkspaceStatus;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectExecutionWorkspaceRepository;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectTaskRepository;
import com.knoweb.salesmanagement.quotation.entity.Quotation;
import com.knoweb.salesmanagement.quotation.enums.QuotationStatus;
import com.knoweb.salesmanagement.quotation.repository.QuotationRepository;
import com.knoweb.salesmanagement.technicalproject.entity.TechnicalProject;
import com.knoweb.salesmanagement.technicalproject.repository.TechnicalProjectRepository;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProjectExecutionWorkspaceService {

    private final ProjectExecutionWorkspaceRepository workspaceRepository;
    private final TechnicalProjectRepository technicalProjectRepository;
    private final QuotationRepository quotationRepository;
    private final ConsolidatedTechnicalEstimateRepository estimateRepository;
    private final UserRepository userRepository;
    private final ProjectTaskRepository taskRepository;

    public ProjectExecutionWorkspaceService(ProjectExecutionWorkspaceRepository workspaceRepository, TechnicalProjectRepository technicalProjectRepository, QuotationRepository quotationRepository, ConsolidatedTechnicalEstimateRepository estimateRepository, UserRepository userRepository, ProjectTaskRepository taskRepository) {
        this.workspaceRepository = workspaceRepository;
        this.technicalProjectRepository = technicalProjectRepository;
        this.quotationRepository = quotationRepository;
        this.estimateRepository = estimateRepository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
    }


    @Transactional
    public ExecutionWorkspaceDTO createWorkspace(UUID technicalProjectId, UUID projectManagerId) {
        if (workspaceRepository.findByTechnicalProjectId(technicalProjectId).isPresent()) {
            throw new RuntimeException("Workspace already exists for this project");
        }

        TechnicalProject project = technicalProjectRepository.findById(technicalProjectId)
                .orElseThrow(() -> new RuntimeException("Technical project not found"));

        // Validate Phase 10 Contract: TechnicalProject -> ConsolidatedTechnicalEstimate -> Quotation -> CLIENT_ACCEPTED
        ConsolidatedTechnicalEstimate estimate = estimateRepository.findByTechnicalProjectIdAndVersionNumber(technicalProjectId, project.getVersion())
                .orElseGet(() -> estimateRepository.findAll().stream()
                        .filter(e -> e.getTechnicalProject().getId().equals(technicalProjectId))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("No technical estimate found for project")));

        List<Quotation> quotations = quotationRepository.findAll().stream()
                .filter(q -> estimate.getId().equals(q.getApprovedEstimateId()))
                .collect(Collectors.toList());

        boolean hasAcceptedQuotation = quotations.stream()
                .anyMatch(q -> q.getStatus() == QuotationStatus.CLIENT_ACCEPTED);

        if (!hasAcceptedQuotation) {
            throw new RuntimeException("Cannot create execution workspace: Project does not have a client accepted quotation.");
        }

        ProjectExecutionWorkspace workspace = new ProjectExecutionWorkspace();
        workspace.setTechnicalProject(project);

        if (projectManagerId != null) {
            User manager = userRepository.findById(projectManagerId)
                    .orElseThrow(() -> new RuntimeException("Project manager not found"));
            workspace.setProjectManager(manager);
        }

        workspace = workspaceRepository.save(workspace);
        return mapToDTO(workspace);
    }

    @Transactional(readOnly = true)
    public List<ExecutionWorkspaceDTO> getAllWorkspaces() {
        return workspaceRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExecutionWorkspaceDTO> getEligibleProjects() {
        List<TechnicalProject> allProjects = technicalProjectRepository.findAll();
        List<Quotation> acceptedQuotations = quotationRepository.findAll().stream()
                .filter(q -> q.getStatus() == QuotationStatus.CLIENT_ACCEPTED)
                .collect(Collectors.toList());

        List<UUID> acceptedEstimateIds = acceptedQuotations.stream()
                .map(Quotation::getApprovedEstimateId)
                .collect(Collectors.toList());

        List<ConsolidatedTechnicalEstimate> eligibleEstimates = estimateRepository.findAll().stream()
                .filter(e -> acceptedEstimateIds.contains(e.getId()))
                .collect(Collectors.toList());

        List<UUID> eligibleProjectIds = eligibleEstimates.stream()
                .map(e -> e.getTechnicalProject().getId())
                .collect(Collectors.toList());

        List<UUID> existingWorkspaceProjectIds = workspaceRepository.findAll().stream()
                .map(ws -> ws.getTechnicalProject().getId())
                .collect(Collectors.toList());

        return allProjects.stream()
                .filter(p -> eligibleProjectIds.contains(p.getId()) && !existingWorkspaceProjectIds.contains(p.getId()))
                .map(p -> {
                    ExecutionWorkspaceDTO dto = new ExecutionWorkspaceDTO();
                    dto.setTechnicalProjectId(p.getId());
                    dto.setProjectCode(p.getProjectCode());
                    dto.setStatus(ExecutionWorkspaceStatus.PLANNED);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ExecutionWorkspaceDTO getWorkspaceById(UUID id) {
        return workspaceRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
    }

    @Transactional
    public ExecutionWorkspaceDTO setupWorkspace(UUID workspaceId, SetupWorkspaceDTO dto) {
        ProjectExecutionWorkspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        if (dto.getPlannedStartDate() != null && dto.getPlannedEndDate() != null) {
            if (dto.getPlannedEndDate().isBefore(dto.getPlannedStartDate())) {
                throw new IllegalArgumentException("Planned end date cannot be before planned start date");
            }
        }

        User manager = userRepository.findById(dto.getProjectManagerId())
                .orElseThrow(() -> new IllegalArgumentException("Project manager not found"));

        if (!manager.isActive()) {
            throw new IllegalArgumentException("Selected project manager is not active");
        }

        boolean isProjectManager = manager.getRoles().stream()
                .anyMatch(r -> "PROJECT_MANAGER".equals(r.getCode()));
        if (!isProjectManager) {
            throw new IllegalArgumentException("Selected user does not have the PROJECT_MANAGER role");
        }

        workspace.setProjectManager(manager);
        workspace.setPlannedStartDate(dto.getPlannedStartDate());
        workspace.setPlannedEndDate(dto.getPlannedEndDate());
        workspace.setStatus(dto.getStatus());
        workspace.setExecutionNotes(dto.getExecutionNotes());

        workspace = workspaceRepository.save(workspace);
        return mapToDTO(workspace);
    }
    
    @Transactional
    public void updateWorkspaceProgress(UUID workspaceId) {
        ProjectExecutionWorkspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
                
        var tasks = taskRepository.findByWorkspaceId(workspaceId);
        if (tasks.isEmpty()) {
            workspace.setOverallProgress(BigDecimal.ZERO);
        } else {
            BigDecimal totalPercentage = tasks.stream()
                    .map(t -> t.getCompletionPercentage() != null ? t.getCompletionPercentage() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal avg = totalPercentage.divide(new BigDecimal(tasks.size()), 2, RoundingMode.HALF_UP);
            workspace.setOverallProgress(avg);
            
            if (avg.compareTo(new BigDecimal("100")) >= 0) {
                workspace.setStatus(ExecutionWorkspaceStatus.COMPLETED);
            } else if (avg.compareTo(BigDecimal.ZERO) > 0 && workspace.getStatus() == ExecutionWorkspaceStatus.PLANNED) {
                workspace.setStatus(ExecutionWorkspaceStatus.IN_PROGRESS);
            }
        }
        workspaceRepository.save(workspace);
    }

    private ExecutionWorkspaceDTO mapToDTO(ProjectExecutionWorkspace workspace) {
        ExecutionWorkspaceDTO dto = new ExecutionWorkspaceDTO();
        dto.setId(workspace.getId());
        dto.setTechnicalProjectId(workspace.getTechnicalProject().getId());
        dto.setProjectCode(workspace.getTechnicalProject().getProjectCode());
        if (workspace.getProjectManager() != null) {
            dto.setProjectManagerId(workspace.getProjectManager().getId());
            dto.setProjectManagerName(workspace.getProjectManager().getFirstName() + " " + workspace.getProjectManager().getLastName());
        }
        dto.setStatus(workspace.getStatus());
        dto.setPlannedStartDate(workspace.getPlannedStartDate());
        dto.setPlannedEndDate(workspace.getPlannedEndDate());
        dto.setActualStartDate(workspace.getActualStartDate());
        dto.setActualEndDate(workspace.getActualEndDate());
        dto.setOverallProgress(workspace.getOverallProgress());
        dto.setExecutionNotes(workspace.getExecutionNotes());
        return dto;
    }
}
