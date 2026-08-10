package com.knoweb.salesmanagement.projectexecution.service;

import com.knoweb.salesmanagement.projectexecution.dto.ProjectTaskDTO;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectExecutionWorkspace;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectTask;
import com.knoweb.salesmanagement.projectexecution.entity.ProjectTaskDependency;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectExecutionWorkspaceRepository;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectTaskDependencyRepository;
import com.knoweb.salesmanagement.projectexecution.repository.ProjectTaskRepository;
import com.knoweb.salesmanagement.projectexecution.repository.TaskStatusHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.knoweb.salesmanagement.projectexecution.repository.DailyProgressUpdateRepository;

class ProjectTaskServiceTest {

    @Mock
    private ProjectTaskRepository taskRepository;
    @Mock
    private ProjectExecutionWorkspaceRepository workspaceRepository;
    @Mock
    private ProjectTaskDependencyRepository dependencyRepository;
    @Mock
    private TaskStatusHistoryRepository historyRepository;
    @Mock
    private ProjectExecutionWorkspaceService workspaceService;
    @Mock
    private ProjectExecutionSecurityHelper securityHelper;
    @Mock
    private DailyProgressUpdateRepository progressUpdateRepository;
    @Mock
    private org.springframework.context.ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private ProjectTaskService taskService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void addTaskDependency_ThrowsException_OnCircularDependency() {
        UUID task1Id = UUID.randomUUID();
        UUID task2Id = UUID.randomUUID();

        ProjectExecutionWorkspace workspace = new ProjectExecutionWorkspace();
        workspace.setId(UUID.randomUUID());

        ProjectTask task1 = new ProjectTask();
        task1.setId(task1Id);
        task1.setWorkspace(workspace);

        ProjectTask task2 = new ProjectTask();
        task2.setId(task2Id);
        task2.setWorkspace(workspace);

        ProjectTaskDependency dep1to2 = new ProjectTaskDependency();
        dep1to2.setTask(task2);
        dep1to2.setPredecessor(task1);

        when(taskRepository.findById(task1Id)).thenReturn(Optional.of(task1));
        when(taskRepository.findById(task2Id)).thenReturn(Optional.of(task2));
        
        // Simulating that task2 already depends on task1
        // So if we try to make task1 depend on task2, it's circular
        when(dependencyRepository.findByTaskId(task2Id)).thenReturn(List.of(dep1to2));

        when(securityHelper.getWorkspaceAndVerifyWriteAccess(any(), any(), any())).thenReturn(workspace);

        UUID currentUserId = UUID.randomUUID();
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("PROJECT_EXECUTION_WRITE"));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            taskService.addTaskDependency(task1Id, task2Id, currentUserId, authorities);
        });

        assertEquals("Circular dependency detected", exception.getMessage());
    }

    @Test
    void evaluateDelayEscalation_SendsNotification_WhenTaskOverdue() {
        // Arrange
        ProjectExecutionWorkspace workspace = new ProjectExecutionWorkspace();
        workspace.setId(UUID.randomUUID());
        
        com.knoweb.salesmanagement.employee.entity.Employee pm = new com.knoweb.salesmanagement.employee.entity.Employee();
        pm.setId(UUID.randomUUID());
        com.knoweb.salesmanagement.user.entity.User user = new com.knoweb.salesmanagement.user.entity.User();
        user.setId(UUID.randomUUID());
        pm.setUser(user);
        workspace.setProjectManager(pm);

        ProjectTask task = new ProjectTask();
        task.setId(UUID.randomUUID());
        task.setTitle("Test Delay Task");
        task.setWorkspace(workspace);
        task.setStatus(com.knoweb.salesmanagement.projectexecution.enums.TaskStatus.IN_PROGRESS);
        task.setCompletionPercentage(java.math.BigDecimal.valueOf(50));
        task.setPlannedEndDate(java.time.LocalDate.now().minusDays(3)); // Overdue by 3 days

        // Act
        taskService.evaluateDelayEscalation(task);

        // Assert
        org.mockito.ArgumentCaptor<com.knoweb.salesmanagement.notification.dto.InternalNotificationEvent> eventCaptor = 
            org.mockito.ArgumentCaptor.forClass(com.knoweb.salesmanagement.notification.dto.InternalNotificationEvent.class);
        
        org.mockito.Mockito.verify(eventPublisher, org.mockito.Mockito.times(1)).publishEvent(eventCaptor.capture());
        
        com.knoweb.salesmanagement.notification.dto.InternalNotificationEvent capturedEvent = eventCaptor.getValue();
        assertEquals("TASK_DELAYED", capturedEvent.getEventType());
        assertEquals("delay_esc_" + task.getId() + "_" + task.getPlannedEndDate(), capturedEvent.getDeduplicationKey());
        assertTrue(capturedEvent.getRecipientUserIds().contains(user.getId()));
    }
}
