package com.knoweb.salesmanagement.approval.service;

import com.knoweb.salesmanagement.approval.entity.WorkflowHistory;
import com.knoweb.salesmanagement.approval.repository.WorkflowHistoryRepository;
import com.knoweb.salesmanagement.common.exception.ResourceConflictException;
import com.knoweb.salesmanagement.opportunity.entity.SalesOpportunity;
import com.knoweb.salesmanagement.opportunity.enums.OpportunityStage;
import com.knoweb.salesmanagement.projectbrief.entity.ProjectBrief;
import com.knoweb.salesmanagement.projectbrief.enums.ProjectBriefStatus;
import com.knoweb.salesmanagement.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WorkflowTransitionService {
    private final WorkflowHistoryRepository workflowHistoryRepository;

    public WorkflowTransitionService(WorkflowHistoryRepository workflowHistoryRepository) {
        this.workflowHistoryRepository = workflowHistoryRepository;
    }

    @Transactional
    public void submitProjectBrief(ProjectBrief brief, User actor) {
        if (brief.getStatus() != ProjectBriefStatus.DRAFT && 
            brief.getStatus() != ProjectBriefStatus.BDM_RETURNED_FOR_REVISION && 
            brief.getStatus() != ProjectBriefStatus.BDM_INFORMATION_REQUESTED && 
            brief.getStatus() != ProjectBriefStatus.CLIENT_CHANGES_REQUESTED) {
            throw new ResourceConflictException("Project brief cannot be submitted from current status: " + brief.getStatus());
        }
        
        String previousState = brief.getStatus().name();
        brief.setStatus(ProjectBriefStatus.AWAITING_BDM_REVIEW);

        SalesOpportunity opp = brief.getOpportunity();
        opp.setStage(OpportunityStage.BRIEF_SUBMITTED);

        recordHistory(opp, brief, actor, "SUBMIT_FOR_BDM_REVIEW", previousState, brief.getStatus().name(), null);
    }

    @Transactional
    public void approveBdmReview(ProjectBrief brief, User actor, String comments) {
        if (brief.getStatus() != ProjectBriefStatus.AWAITING_BDM_REVIEW) {
            throw new ResourceConflictException("Cannot approve BDM review. Brief is not in AWAITING_BDM_REVIEW state.");
        }
        
        String previousState = brief.getStatus().name();
        brief.setStatus(ProjectBriefStatus.BDM_APPROVED);

        recordHistory(brief.getOpportunity(), brief, actor, "BDM_APPROVE", previousState, brief.getStatus().name(), comments);
    }

    @Transactional
    public void rejectBdmReview(ProjectBrief brief, User actor, String comments) {
        if (brief.getStatus() != ProjectBriefStatus.AWAITING_BDM_REVIEW) {
            throw new ResourceConflictException("Cannot reject BDM review. Brief is not in AWAITING_BDM_REVIEW state.");
        }
        
        String previousState = brief.getStatus().name();
        brief.setStatus(ProjectBriefStatus.BDM_REJECTED);

        SalesOpportunity opp = brief.getOpportunity();
        opp.setStage(OpportunityStage.LOST);
        opp.setLostReason("Project Brief rejected by BDM");

        recordHistory(opp, brief, actor, "BDM_REJECT", previousState, brief.getStatus().name(), comments);
    }

    @Transactional
    public void returnBdmReview(ProjectBrief brief, User actor, String comments) {
        if (brief.getStatus() != ProjectBriefStatus.AWAITING_BDM_REVIEW) {
            throw new ResourceConflictException("Cannot return BDM review. Brief is not in AWAITING_BDM_REVIEW state.");
        }
        
        String previousState = brief.getStatus().name();
        brief.setStatus(ProjectBriefStatus.BDM_RETURNED_FOR_REVISION);

        recordHistory(brief.getOpportunity(), brief, actor, "BDM_RETURN_FOR_REVISION", previousState, brief.getStatus().name(), comments);
    }

    @Transactional
    public void requestInformationBdm(ProjectBrief brief, User actor, String comments) {
        if (brief.getStatus() != ProjectBriefStatus.AWAITING_BDM_REVIEW) {
            throw new ResourceConflictException("Cannot request info on BDM review. Brief is not in AWAITING_BDM_REVIEW state.");
        }
        
        String previousState = brief.getStatus().name();
        brief.setStatus(ProjectBriefStatus.BDM_INFORMATION_REQUESTED);

        recordHistory(brief.getOpportunity(), brief, actor, "BDM_REQUEST_INFORMATION", previousState, brief.getStatus().name(), comments);
    }

    @Transactional
    public void createClientVerification(ProjectBrief brief, User actor) {
        if (brief.getStatus() != ProjectBriefStatus.BDM_APPROVED) {
            throw new ResourceConflictException("Cannot create client verification. Brief must be BDM_APPROVED.");
        }
        
        String previousState = brief.getStatus().name();
        brief.setStatus(ProjectBriefStatus.AWAITING_CLIENT_VERIFICATION);

        recordHistory(brief.getOpportunity(), brief, actor, "CREATE_CLIENT_VERIFICATION", previousState, brief.getStatus().name(), null);
    }

    @Transactional
    public void confirmClientVerification(ProjectBrief brief, String verifierName, String comments) {
        if (brief.getStatus() != ProjectBriefStatus.AWAITING_CLIENT_VERIFICATION) {
            throw new ResourceConflictException("Cannot confirm verification. Brief is not in AWAITING_CLIENT_VERIFICATION state.");
        }
        
        String previousState = brief.getStatus().name();
        brief.setStatus(ProjectBriefStatus.CLIENT_VERIFIED);

        SalesOpportunity opp = brief.getOpportunity();
        opp.setStage(OpportunityStage.READY_FOR_TECHNICAL_ROUTING);

        WorkflowHistory history = new WorkflowHistory();
        history.setOpportunity(opp);
        history.setProjectBrief(brief);
        history.setProjectBriefVersionNumber(brief.getCurrentVersionNumber());
        history.setActorName(verifierName);
        history.setAction("CLIENT_CONFIRM");
        history.setPreviousState(previousState);
        history.setNewState(brief.getStatus().name());
        history.setComments(comments);
        workflowHistoryRepository.save(history);
    }

    @Transactional
    public void requestChangesClient(ProjectBrief brief, String verifierName, String comments) {
        if (brief.getStatus() != ProjectBriefStatus.AWAITING_CLIENT_VERIFICATION) {
            throw new ResourceConflictException("Cannot request changes. Brief is not in AWAITING_CLIENT_VERIFICATION state.");
        }
        
        String previousState = brief.getStatus().name();
        brief.setStatus(ProjectBriefStatus.CLIENT_CHANGES_REQUESTED);

        WorkflowHistory history = new WorkflowHistory();
        history.setOpportunity(brief.getOpportunity());
        history.setProjectBrief(brief);
        history.setProjectBriefVersionNumber(brief.getCurrentVersionNumber());
        history.setActorName(verifierName);
        history.setAction("CLIENT_REQUEST_CHANGES");
        history.setPreviousState(previousState);
        history.setNewState(brief.getStatus().name());
        history.setComments(comments);
        workflowHistoryRepository.save(history);
    }

    @Transactional
    public void rejectClientVerification(ProjectBrief brief, String verifierName, String comments) {
        if (brief.getStatus() != ProjectBriefStatus.AWAITING_CLIENT_VERIFICATION) {
            throw new ResourceConflictException("Cannot reject verification. Brief is not in AWAITING_CLIENT_VERIFICATION state.");
        }
        
        String previousState = brief.getStatus().name();
        brief.setStatus(ProjectBriefStatus.CLIENT_REJECTED);

        SalesOpportunity opp = brief.getOpportunity();
        opp.setStage(OpportunityStage.LOST);
        opp.setLostReason("Project Brief rejected by Client");

        WorkflowHistory history = new WorkflowHistory();
        history.setOpportunity(opp);
        history.setProjectBrief(brief);
        history.setProjectBriefVersionNumber(brief.getCurrentVersionNumber());
        history.setActorName(verifierName);
        history.setAction("CLIENT_REJECT");
        history.setPreviousState(previousState);
        history.setNewState(brief.getStatus().name());
        history.setComments(comments);
        workflowHistoryRepository.save(history);
    }

    private void recordHistory(SalesOpportunity opp, ProjectBrief brief, User actor, String action, String previousState, String newState, String comments) {
        WorkflowHistory history = new WorkflowHistory();
        history.setOpportunity(opp);
        history.setProjectBrief(brief);
        history.setProjectBriefVersionNumber(brief.getCurrentVersionNumber());
        history.setActor(actor);
        if (actor != null) {
            history.setActorName(actor.getFirstName() + " " + actor.getLastName());
        }
        history.setAction(action);
        history.setPreviousState(previousState);
        history.setNewState(newState);
        history.setComments(comments);
        workflowHistoryRepository.save(history);
    }
}
