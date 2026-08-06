package com.knoweb.salesmanagement.projectexecution.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class ProjectTaskDependencyDTO {
    private UUID id;
    @NotNull
    private UUID taskId;
    @NotNull
    private UUID predecessorTaskId;
    private String predecessorTaskTitle;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getTaskId() { return taskId; }
    public void setTaskId(UUID taskId) { this.taskId = taskId; }
    public UUID getPredecessorTaskId() { return predecessorTaskId; }
    public void setPredecessorTaskId(UUID predecessorTaskId) { this.predecessorTaskId = predecessorTaskId; }
    public String getPredecessorTaskTitle() { return predecessorTaskTitle; }
    public void setPredecessorTaskTitle(String predecessorTaskTitle) { this.predecessorTaskTitle = predecessorTaskTitle; }

}
