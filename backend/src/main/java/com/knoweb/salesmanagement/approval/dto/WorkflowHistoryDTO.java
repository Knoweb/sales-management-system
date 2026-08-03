package com.knoweb.salesmanagement.approval.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class WorkflowHistoryDTO {
    private UUID id;
    private UUID opportunityId;
    private UUID projectBriefId;
    private Integer projectBriefVersionNumber;
    private UUID actorId;
    private String actorName;
    private String action;
    private String previousState;
    private String newState;
    private String comments;
    private OffsetDateTime createdAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getOpportunityId() { return opportunityId; }
    public void setOpportunityId(UUID opportunityId) { this.opportunityId = opportunityId; }
    public UUID getProjectBriefId() { return projectBriefId; }
    public void setProjectBriefId(UUID projectBriefId) { this.projectBriefId = projectBriefId; }
    public Integer getProjectBriefVersionNumber() { return projectBriefVersionNumber; }
    public void setProjectBriefVersionNumber(Integer projectBriefVersionNumber) { this.projectBriefVersionNumber = projectBriefVersionNumber; }
    public UUID getActorId() { return actorId; }
    public void setActorId(UUID actorId) { this.actorId = actorId; }
    public String getActorName() { return actorName; }
    public void setActorName(String actorName) { this.actorName = actorName; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getPreviousState() { return previousState; }
    public void setPreviousState(String previousState) { this.previousState = previousState; }
    public String getNewState() { return newState; }
    public void setNewState(String newState) { this.newState = newState; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
