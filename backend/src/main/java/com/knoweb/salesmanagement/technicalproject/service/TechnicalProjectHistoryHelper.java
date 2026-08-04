package com.knoweb.salesmanagement.technicalproject.service;

import com.knoweb.salesmanagement.technicalproject.entity.TechnicalProject;
import com.knoweb.salesmanagement.technicalproject.entity.TechnicalProjectHistory;
import com.knoweb.salesmanagement.technicalproject.enums.TechnicalProjectHistoryAction;
import com.knoweb.salesmanagement.technicalproject.repository.TechnicalProjectHistoryRepository;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

// Minimal stub for Phase 7 history recording without requiring full Phase 19 audit features.
@Service
public class TechnicalProjectHistoryHelper {

    private final TechnicalProjectHistoryRepository historyRepository;
    private final UserRepository userRepository;

    public TechnicalProjectHistoryHelper(TechnicalProjectHistoryRepository historyRepository, UserRepository userRepository) {
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void recordProjectCreated(TechnicalProject technicalProject) {
        TechnicalProjectHistory history = new TechnicalProjectHistory();
        history.setTechnicalProject(technicalProject);
        history.setEntityType("TechnicalProject");
        history.setEntityId(technicalProject.getId());
        history.setAction(TechnicalProjectHistoryAction.TECHNICAL_PROJECT_CREATED);
        history.setNewValue("{\"status\": \"" + technicalProject.getStatus() + "\"}");
        
        if (technicalProject.getCreatedBy() != null) {
            User actedBy = userRepository.findById(technicalProject.getCreatedBy()).orElse(null);
            history.setActedBy(actedBy);
        }

        historyRepository.save(history);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void recordAction(TechnicalProject technicalProject, 
                             TechnicalProjectHistoryAction action, 
                             String previousValue, 
                             String newValue, 
                             String reason, 
                             UUID actedById) {
        
        TechnicalProjectHistory history = new TechnicalProjectHistory();
        history.setTechnicalProject(technicalProject);
        history.setEntityType("TechnicalProject");
        history.setEntityId(technicalProject.getId());
        history.setAction(action);
        
        // Storing as JSON string per field requirement.
        if (previousValue != null) {
            history.setPreviousValue("{\"value\": \"" + previousValue.replace("\"", "\\\"") + "\"}");
        }
        if (newValue != null) {
            history.setNewValue("{\"value\": \"" + newValue.replace("\"", "\\\"") + "\"}");
        }
        
        history.setReason(reason);

        if (actedById != null) {
            User actedBy = userRepository.findById(actedById).orElse(null);
            history.setActedBy(actedBy);
        }

        historyRepository.save(history);
    }
}
