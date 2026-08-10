package com.knoweb.salesmanagement.projectexecution;

import com.knoweb.salesmanagement.projectexecution.dto.ProjectClosureDTO;
import com.knoweb.salesmanagement.projectexecution.enums.InspectionStatus;
import com.knoweb.salesmanagement.projectexecution.enums.TaskStatus;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectExecutionWorkspace;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectTask;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectExecutionWorkspaceRepository;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectTaskRepository;
import com.knoweb.salesmanagement.projectexecution.service.ProjectExecutionWorkspaceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class ProjectClosureIntegrationTest {

    @Autowired
    private ProjectExecutionWorkspaceService workspaceService;

    @Autowired
    private ProjectExecutionWorkspaceRepository workspaceRepository;

    @Autowired
    private ProjectTaskRepository taskRepository;

    private ProjectExecutionWorkspace createTestWorkspace() {
        // Find any existing workspace or mock one
        return workspaceRepository.findAll().stream().findFirst().orElseThrow(() -> new RuntimeException("No workspaces found for test."));
    }

    @Test
    @WithMockUser(username = "admin@test.com", authorities = {"PROJECT_EXECUTION_WRITE"})
    public void testPassedRequiresNoActiveTasks() {
        ProjectExecutionWorkspace workspace = createTestWorkspace();
        
        ProjectTask activeTask = new ProjectTask();
        activeTask.setWorkspace(workspace);
        activeTask.setTitle("Test Task");
        activeTask.setStatus(TaskStatus.IN_PROGRESS);
        taskRepository.save(activeTask);

        ProjectClosureDTO dto = new ProjectClosureDTO();
        dto.setInspectionStatus(InspectionStatus.PASSED);
        dto.setInspectionDate(LocalDate.now());

        Exception e = assertThrows(IllegalArgumentException.class, () -> {
            workspaceService.updateClosure(workspace.getId(), dto);
        });
        assertTrue(e.getMessage().contains("Cannot mark inspection as PASSED"));
    }

    @Test
    @WithMockUser(username = "admin@test.com", authorities = {"PROJECT_EXECUTION_WRITE"})
    public void testPassedAllowsCompletedTasks() {
        ProjectExecutionWorkspace workspace = createTestWorkspace();
        
        ProjectTask completedTask = new ProjectTask();
        completedTask.setWorkspace(workspace);
        completedTask.setTitle("Test Task");
        completedTask.setStatus(TaskStatus.COMPLETED);
        taskRepository.save(completedTask);

        ProjectClosureDTO dto = new ProjectClosureDTO();
        dto.setInspectionStatus(InspectionStatus.PASSED);
        dto.setInspectionDate(LocalDate.now());
        dto.setInstallationCompleted(true);

        var result = workspaceService.updateClosure(workspace.getId(), dto);
        assertEquals(InspectionStatus.PASSED, result.getInspectionStatus());
        assertTrue(result.getInstallationCompleted());
    }

    @Test
    @WithMockUser(username = "admin@test.com", authorities = {"PROJECT_EXECUTION_WRITE"})
    public void testPassedRequiresInspectionDate() {
        ProjectExecutionWorkspace workspace = createTestWorkspace();
        
        ProjectClosureDTO dto = new ProjectClosureDTO();
        dto.setInspectionStatus(InspectionStatus.PASSED);

        Exception e = assertThrows(IllegalArgumentException.class, () -> {
            workspaceService.updateClosure(workspace.getId(), dto);
        });
        assertTrue(e.getMessage().contains("Inspection date is required"));
    }
}
