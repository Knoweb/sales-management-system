package com.knoweb.salesmanagement.approval.controller;

import com.knoweb.salesmanagement.approval.dto.WorkflowHistoryDTO;
import com.knoweb.salesmanagement.approval.repository.WorkflowHistoryRepository;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
public class WorkflowHistoryController {

    private final WorkflowHistoryRepository workflowHistoryRepository;
    private final UserRepository userRepository;

    public WorkflowHistoryController(WorkflowHistoryRepository workflowHistoryRepository, UserRepository userRepository) {
        this.workflowHistoryRepository = workflowHistoryRepository;
        this.userRepository = userRepository;
    }

    @PreAuthorize("hasAuthority('APPROVAL_HISTORY_READ')")
    @GetMapping("/opportunities/{opportunityId}/approval-history")
    public ResponseEntity<List<WorkflowHistoryDTO>> getHistory(@PathVariable UUID opportunityId) {
        List<WorkflowHistoryDTO> dtos = workflowHistoryRepository.findByOpportunityIdOrderByCreatedAtDesc(opportunityId)
                .stream().map(h -> {
                    WorkflowHistoryDTO dto = new WorkflowHistoryDTO();
                    dto.setId(h.getId());
                    dto.setOpportunityId(h.getOpportunity().getId());
                    dto.setProjectBriefId(h.getProjectBrief().getId());
                    dto.setProjectBriefVersionNumber(h.getProjectBriefVersionNumber());
                    if (h.getActor() != null) {
                        dto.setActorId(h.getActor().getId());
                    }
                    dto.setActorName(h.getActorName());
                    dto.setAction(h.getAction());
                    dto.setPreviousState(h.getPreviousState());
                    dto.setNewState(h.getNewState());
                    dto.setComments(h.getComments());
                    dto.setCreatedAt(h.getCreatedAt());
                    return dto;
                }).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
