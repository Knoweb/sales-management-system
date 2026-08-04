package com.knoweb.salesmanagement.technicalproject.service;

import com.knoweb.salesmanagement.projectbrief.entity.ProjectBrief;
import com.knoweb.salesmanagement.projectbrief.repository.ProjectBriefRepository;
import com.knoweb.salesmanagement.technicalproject.dto.TechnicalProjectEligibilityDTO;
import com.knoweb.salesmanagement.technicalproject.entity.TechnicalProject;
import com.knoweb.salesmanagement.technicalproject.enums.TechnicalProjectStatus;
import com.knoweb.salesmanagement.technicalproject.exception.TechnicalProjectAlreadyExistsException;
import com.knoweb.salesmanagement.technicalproject.exception.TechnicalProjectNotEligibleException;
import com.knoweb.salesmanagement.technicalproject.repository.TechnicalProjectRepository;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
public class TechnicalProjectInitializationService {

    private final TechnicalProjectRepository technicalProjectRepository;
    private final ProjectBriefRepository projectBriefRepository;
    private final TechnicalProjectEligibilityService eligibilityService;
    private final UserRepository userRepository;
    private final TechnicalProjectHistoryHelper historyHelper;

    public TechnicalProjectInitializationService(TechnicalProjectRepository technicalProjectRepository,
                                                 ProjectBriefRepository projectBriefRepository,
                                                 TechnicalProjectEligibilityService eligibilityService,
                                                 UserRepository userRepository,
                                                 TechnicalProjectHistoryHelper historyHelper) {
        this.technicalProjectRepository = technicalProjectRepository;
        this.projectBriefRepository = projectBriefRepository;
        this.eligibilityService = eligibilityService;
        this.userRepository = userRepository;
        this.historyHelper = historyHelper;
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    private String generateProjectCode() {
        long count = technicalProjectRepository.count() + 1;
        String prefix = "TP-" + LocalDate.now().getYear() + "-";
        String number = String.format("%06d", count);
        while (technicalProjectRepository.existsByProjectCode(prefix + number)) {
            count++;
            number = String.format("%06d", count);
        }
        return prefix + number;
    }

    @Transactional
    public TechnicalProject initializeTechnicalProject(UUID projectBriefId) {
        TechnicalProjectEligibilityDTO eligibility = eligibilityService.checkEligibility(projectBriefId);
        if (!eligibility.isEligible()) {
            if (eligibility.isTechnicalProjectAlreadyExists()) {
                throw new TechnicalProjectAlreadyExistsException(eligibility.getReason());
            }
            throw new TechnicalProjectNotEligibleException(eligibility.getReason());
        }

        ProjectBrief brief = projectBriefRepository.findById(projectBriefId)
            .orElseThrow(() -> new TechnicalProjectNotEligibleException("Project brief not found"));

        User actingUser = getAuthenticatedUser();

        TechnicalProject project = new TechnicalProject();
        project.setProjectBrief(brief);
        project.setSalesOpportunity(brief.getOpportunity());
        project.setProjectCode(generateProjectCode());
        project.setStatus(TechnicalProjectStatus.AWAITING_TECHNICAL_ROUTING);
        project.setRoutedAt(null);
        
        // Use authenticated user if present (e.g. Technical Coordinator initializing it)
        if (actingUser != null) {
            project.setCreatedBy(actingUser.getId());
        }

        try {
            project = technicalProjectRepository.save(project);
            historyHelper.recordProjectCreated(project);
            return project;
        } catch (DataIntegrityViolationException e) {
            throw new TechnicalProjectAlreadyExistsException("A technical project was already created concurrently for this project brief.");
        }
    }
}
