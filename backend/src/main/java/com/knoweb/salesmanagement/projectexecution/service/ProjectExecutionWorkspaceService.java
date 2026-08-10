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
import com.knoweb.salesmanagement.projectexecution.entity.ProjectTask;
import com.knoweb.salesmanagement.technicalproject.entity.TechnicalProject;
import com.knoweb.salesmanagement.technicalproject.repository.TechnicalProjectRepository;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import com.knoweb.salesmanagement.employee.repository.EmployeeRepository;
import com.knoweb.salesmanagement.employee.entity.Employee;
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
    private final EmployeeRepository employeeRepository;
    private final ProjectTaskRepository taskRepository;
    private final com.knoweb.salesmanagement.projectexecution.repository.DailyProgressUpdateRepository progressRepository;

    public ProjectExecutionWorkspaceService(ProjectExecutionWorkspaceRepository workspaceRepository, TechnicalProjectRepository technicalProjectRepository, QuotationRepository quotationRepository, ConsolidatedTechnicalEstimateRepository estimateRepository, UserRepository userRepository, ProjectTaskRepository taskRepository, EmployeeRepository employeeRepository, com.knoweb.salesmanagement.projectexecution.repository.DailyProgressUpdateRepository progressRepository) {
        this.workspaceRepository = workspaceRepository;
        this.technicalProjectRepository = technicalProjectRepository;
        this.quotationRepository = quotationRepository;
        this.estimateRepository = estimateRepository;
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.taskRepository = taskRepository;
        this.progressRepository = progressRepository;
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
            Employee manager = employeeRepository.findById(projectManagerId)
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

    @Transactional
    public ExecutionWorkspaceDTO getWorkspaceById(UUID id) {
        ProjectExecutionWorkspace workspace = workspaceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
        
        // Recalculate progress on load to fix stale legacy records
        recalculateWorkspaceProgress(workspace);
        
        return mapToDTO(workspace);
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

        Employee manager = employeeRepository.findById(dto.getProjectManagerId())
                .orElseThrow(() -> new IllegalArgumentException("Project manager not found"));

        if (!manager.getUser().isActive()) {
            throw new IllegalArgumentException("Selected project manager is not active");
        }

        boolean isProjectManager = manager.getUser().getRoles().stream()
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
    public ExecutionWorkspaceDTO updateClosure(UUID workspaceId, com.knoweb.salesmanagement.projectexecution.dto.ProjectClosureDTO dto) {
        ProjectExecutionWorkspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        if (dto.getInspectionStatus() == com.knoweb.salesmanagement.projectexecution.enums.InspectionStatus.PASSED || 
            dto.getInspectionStatus() == com.knoweb.salesmanagement.projectexecution.enums.InspectionStatus.FAILED) {
            if (dto.getInspectionDate() == null) {
                throw new IllegalArgumentException("Inspection date is required when status is PASSED or FAILED.");
            }
        }

        // ALWAYS check for active tasks before ANY closure update
        java.util.List<ProjectTask> tasks = taskRepository.findByWorkspaceId(workspaceId);
        boolean hasActiveTasks = false;
        
        for (ProjectTask t : tasks) {
            if (t.getStatus() != com.knoweb.salesmanagement.projectexecution.enums.TaskStatus.COMPLETED && 
                t.getStatus() != com.knoweb.salesmanagement.projectexecution.enums.TaskStatus.CANCELLED) {
                hasActiveTasks = true;
                break;
            }
        }
        
        if (hasActiveTasks) {
            throw new IllegalArgumentException("Complete or cancel all active tasks before entering project closure details.");
        }

        if (Boolean.TRUE.equals(dto.getClientAccepted())) {
            if (dto.getClientAcceptanceDate() == null) {
                throw new IllegalArgumentException("Client acceptance date is required when client accepted is true.");
            }
            com.knoweb.salesmanagement.projectexecution.enums.InspectionStatus effectiveInspectionStatus = 
                dto.getInspectionStatus() != null ? dto.getInspectionStatus() : workspace.getInspectionStatus();
            if (effectiveInspectionStatus != com.knoweb.salesmanagement.projectexecution.enums.InspectionStatus.PASSED) {
                throw new IllegalArgumentException("Client acceptance can only be recorded if Final Inspection is PASSED.");
            }
            java.time.LocalDate effectiveDeliveryDate = dto.getDeliveryDate() != null ? dto.getDeliveryDate() : workspace.getDeliveryDate();
            if (effectiveDeliveryDate == null) {
                throw new IllegalArgumentException("Client acceptance can only be recorded if Delivery Date exists.");
            }
            boolean effectiveInstallationCompleted = dto.getInstallationCompleted() != null ? dto.getInstallationCompleted() : workspace.getInstallationCompleted();
            if (!effectiveInstallationCompleted) {
                throw new IllegalArgumentException("Client acceptance can only be recorded if Installation is completed.");
            }
        }

        if (dto.getWarrantyStartDate() != null || dto.getWarrantyEndDate() != null || (dto.getWarrantyNotes() != null && !dto.getWarrantyNotes().isEmpty())) {
            boolean effectiveClientAccepted = dto.getClientAccepted() != null ? dto.getClientAccepted() : workspace.getClientAccepted();
            java.time.LocalDate effectiveClientAcceptanceDate = dto.getClientAcceptanceDate() != null ? dto.getClientAcceptanceDate() : workspace.getClientAcceptanceDate();
            
            if (!effectiveClientAccepted || effectiveClientAcceptanceDate == null) {
                throw new IllegalArgumentException("Warranty details can only be recorded after Client Acceptance.");
            }
            if (dto.getWarrantyStartDate() != null && dto.getWarrantyEndDate() != null) {
                if (dto.getWarrantyEndDate().isBefore(dto.getWarrantyStartDate())) {
                    throw new IllegalArgumentException("Warranty end date cannot be before warranty start date.");
                }
            }
        }

        workspace.setInspectionStatus(dto.getInspectionStatus() != null ? dto.getInspectionStatus() : com.knoweb.salesmanagement.projectexecution.enums.InspectionStatus.PENDING);
        workspace.setInspectionDate(dto.getInspectionDate());
        workspace.setInspectionNotes(dto.getInspectionNotes());
        workspace.setDeliveryDate(dto.getDeliveryDate());
        workspace.setInstallationCompleted(dto.getInstallationCompleted() != null ? dto.getInstallationCompleted() : false);
        workspace.setDeliveryNotes(dto.getDeliveryNotes());

        workspace.setClientAccepted(dto.getClientAccepted() != null ? dto.getClientAccepted() : false);
        workspace.setClientAcceptanceDate(dto.getClientAcceptanceDate());
        workspace.setClientAcceptanceNotes(dto.getClientAcceptanceNotes());

        workspace.setWarrantyStartDate(dto.getWarrantyStartDate());
        workspace.setWarrantyEndDate(dto.getWarrantyEndDate());
        workspace.setWarrantyNotes(dto.getWarrantyNotes());

        workspace = workspaceRepository.save(workspace);
        return mapToDTO(workspace);
    }
    
    @Transactional
    public void updateWorkspaceProgress(UUID workspaceId) {
        ProjectExecutionWorkspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
                
        recalculateWorkspaceProgress(workspace);
    }
    
    public void recalculateWorkspaceProgress(ProjectExecutionWorkspace workspace) {
        var allTasks = taskRepository.findByWorkspaceId(workspace.getId());
        
        // Exclude CANCELLED tasks completely
        java.util.List<ProjectTask> validTasks = allTasks.stream()
            .filter(t -> t.getStatus() != com.knoweb.salesmanagement.projectexecution.enums.TaskStatus.CANCELLED)
            .collect(Collectors.toList());

        if (validTasks.isEmpty()) {
            workspace.setOverallProgress(BigDecimal.ZERO);
            if (workspace.getStatus() == ExecutionWorkspaceStatus.COMPLETED) {
                workspace.setStatus(ExecutionWorkspaceStatus.IN_PROGRESS);
            }
        } else {
            BigDecimal totalPercentage = BigDecimal.ZERO;
            for (ProjectTask t : validTasks) {
                BigDecimal p = t.getCompletionPercentage() != null ? t.getCompletionPercentage() : BigDecimal.ZERO;
                // COMPLETED tasks count as 100%
                if (t.getStatus() == com.knoweb.salesmanagement.projectexecution.enums.TaskStatus.COMPLETED) {
                    p = new BigDecimal("100");
                }
                totalPercentage = totalPercentage.add(p);
            }
            BigDecimal avg = totalPercentage.divide(new BigDecimal(validTasks.size()), 2, RoundingMode.HALF_UP);
            
            if (avg.compareTo(new BigDecimal("100")) > 0) avg = new BigDecimal("100");
            if (avg.compareTo(BigDecimal.ZERO) < 0) avg = BigDecimal.ZERO;

            workspace.setOverallProgress(avg);
            
            if (avg.compareTo(new BigDecimal("100")) >= 0) {
                workspace.setStatus(ExecutionWorkspaceStatus.COMPLETED);
            } else {
                if (workspace.getStatus() == ExecutionWorkspaceStatus.COMPLETED) {
                    workspace.setStatus(ExecutionWorkspaceStatus.IN_PROGRESS);
                } else if (avg.compareTo(BigDecimal.ZERO) > 0 && workspace.getStatus() == ExecutionWorkspaceStatus.PLANNED) {
                    workspace.setStatus(ExecutionWorkspaceStatus.IN_PROGRESS);
                }
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
        
        dto.setInspectionStatus(workspace.getInspectionStatus());
        dto.setInspectionDate(workspace.getInspectionDate());
        dto.setInspectionNotes(workspace.getInspectionNotes());
        dto.setDeliveryDate(workspace.getDeliveryDate());
        dto.setInstallationCompleted(workspace.getInstallationCompleted());
        dto.setDeliveryNotes(workspace.getDeliveryNotes());
        
        dto.setClientAccepted(workspace.getClientAccepted());
        dto.setClientAcceptanceDate(workspace.getClientAcceptanceDate());
        dto.setClientAcceptanceNotes(workspace.getClientAcceptanceNotes());
        
        dto.setWarrantyStartDate(workspace.getWarrantyStartDate());
        dto.setWarrantyEndDate(workspace.getWarrantyEndDate());
        dto.setWarrantyNotes(workspace.getWarrantyNotes());
        
        return dto;
    }
}
