package com.knoweb.salesmanagement.approval.controller;

import com.knoweb.salesmanagement.approval.dto.BdmApprovalDTO;
import com.knoweb.salesmanagement.approval.dto.BdmDecisionRequest;
import com.knoweb.salesmanagement.approval.service.BdmApprovalService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class BdmApprovalController {

    private final BdmApprovalService bdmApprovalService;

    public BdmApprovalController(BdmApprovalService bdmApprovalService) {
        this.bdmApprovalService = bdmApprovalService;
    }

    @GetMapping("/opportunities/{opportunityId}/bdm-approvals")
    public ResponseEntity<List<BdmApprovalDTO>> getApprovals(@PathVariable UUID opportunityId) {
        return ResponseEntity.ok(bdmApprovalService.getApprovalsForOpportunity(opportunityId));
    }

    @GetMapping({"/bdm-approvals/pending", "/bdm-approvals"})
    public ResponseEntity<List<BdmApprovalDTO>> getPendingApprovals() {
        return ResponseEntity.ok(bdmApprovalService.getPendingApprovals());
    }

    @GetMapping("/bdm-approvals/{id}")
    public ResponseEntity<BdmApprovalDTO> getApproval(@PathVariable UUID id) {
        return ResponseEntity.ok(bdmApprovalService.getApprovalById(id));
    }

    @PostMapping("/project-briefs/{briefId}/bdm-approve")
    public ResponseEntity<BdmApprovalDTO> approve(@PathVariable UUID briefId, @Valid @RequestBody BdmDecisionRequest request) {
        return ResponseEntity.ok(bdmApprovalService.approve(briefId, request));
    }

    @PostMapping("/project-briefs/{briefId}/bdm-reject")
    public ResponseEntity<BdmApprovalDTO> reject(@PathVariable UUID briefId, @Valid @RequestBody BdmDecisionRequest request) {
        return ResponseEntity.ok(bdmApprovalService.reject(briefId, request));
    }

    @PostMapping("/project-briefs/{briefId}/bdm-return")
    public ResponseEntity<BdmApprovalDTO> returnForRevision(@PathVariable UUID briefId, @Valid @RequestBody BdmDecisionRequest request) {
        return ResponseEntity.ok(bdmApprovalService.returnForRevision(briefId, request));
    }

    @PostMapping("/project-briefs/{briefId}/bdm-request-info")
    public ResponseEntity<BdmApprovalDTO> requestInfo(@PathVariable UUID briefId, @Valid @RequestBody BdmDecisionRequest request) {
        return ResponseEntity.ok(bdmApprovalService.requestInformation(briefId, request));
    }
}
