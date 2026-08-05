package com.knoweb.salesmanagement.costing.controller;

import com.knoweb.salesmanagement.costing.dto.*;
import com.knoweb.salesmanagement.costing.service.TechnicalCostingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/technical-projects/{projectId}/estimates")
public class TechnicalCostingController {

    private final TechnicalCostingService costingService;

    public TechnicalCostingController(TechnicalCostingService costingService) {
        this.costingService = costingService;
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<DepartmentEstimateDTO> getDepartmentEstimate(
            @PathVariable UUID projectId,
            @PathVariable UUID departmentId) {
        return ResponseEntity.ok(costingService.getDepartmentEstimate(projectId, departmentId));
    }

    @PutMapping("/department/{departmentId}")
    public ResponseEntity<DepartmentEstimateDTO> saveDepartmentEstimate(
            @PathVariable UUID projectId,
            @PathVariable UUID departmentId,
            @Valid @RequestBody DepartmentEstimateSaveRequest request) {
        return ResponseEntity.ok(costingService.saveDepartmentEstimate(projectId, departmentId, request));
    }

    @PostMapping("/department/{departmentId}/submit")
    public ResponseEntity<DepartmentEstimateDTO> submitDepartmentEstimate(
            @PathVariable UUID projectId,
            @PathVariable UUID departmentId) {
        return ResponseEntity.ok(costingService.submitDepartmentEstimate(projectId, departmentId));
    }

    @GetMapping("/department/{departmentId}/history")
    public ResponseEntity<List<DepartmentEstimateDTO>> getDepartmentEstimateHistory(
            @PathVariable UUID projectId,
            @PathVariable UUID departmentId) {
        return ResponseEntity.ok(costingService.getDepartmentEstimateHistory(projectId, departmentId));
    }

    @GetMapping("/submitted")
    public ResponseEntity<List<DepartmentEstimateDTO>> getSubmittedEstimates(
            @PathVariable UUID projectId) {
        return ResponseEntity.ok(costingService.getSubmittedOrLatestEstimatesForProject(projectId));
    }

    @PostMapping("/department/{departmentId}/request-revision")
    public ResponseEntity<DepartmentEstimateDTO> requestRevision(
            @PathVariable UUID projectId,
            @PathVariable UUID departmentId,
            @Valid @RequestBody RevisionRequest request) {
        return ResponseEntity.ok(costingService.requestRevision(projectId, departmentId, request));
    }

    @PostMapping("/consolidate-and-approve")
    public ResponseEntity<ConsolidatedTechnicalEstimateDTO> consolidateAndApprove(
            @PathVariable UUID projectId) {
        return ResponseEntity.ok(costingService.consolidateAndApprove(projectId));
    }

    @GetMapping("/consolidated")
    public ResponseEntity<ConsolidatedTechnicalEstimateDTO> getLatestConsolidatedEstimate(
            @PathVariable UUID projectId) {
        return costingService.getLatestConsolidatedEstimate(projectId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/consolidated/history")
    public ResponseEntity<List<ConsolidatedTechnicalEstimateDTO>> getConsolidatedEstimateHistory(
            @PathVariable UUID projectId) {
        return ResponseEntity.ok(costingService.getConsolidatedEstimateHistory(projectId));
    }

    @GetMapping("/approved-summary")
    public ResponseEntity<ApprovedTechnicalEstimateSummaryDTO> getApprovedEstimateSummary(
            @PathVariable UUID projectId) {
        return ResponseEntity.ok(costingService.getApprovedEstimateSummary(projectId));
    }
}
