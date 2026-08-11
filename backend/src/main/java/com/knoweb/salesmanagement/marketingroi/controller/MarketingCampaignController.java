package com.knoweb.salesmanagement.marketingroi.controller;

import com.knoweb.salesmanagement.marketingroi.dto.*;
import com.knoweb.salesmanagement.marketingroi.service.MarketingRoiService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/marketing")
public class MarketingCampaignController {

    private final MarketingRoiService service;

    @Autowired
    public MarketingCampaignController(MarketingRoiService service) {
        this.service = service;
    }

    @GetMapping("/campaigns")
    @PreAuthorize("hasAuthority('MARKETING_ROI_READ')")
    public ResponseEntity<List<MarketingCampaignDto>> getAllCampaigns() {
        return ResponseEntity.ok(service.getAllCampaigns());
    }

    @GetMapping("/campaigns/{id}")
    @PreAuthorize("hasAuthority('MARKETING_ROI_READ')")
    public ResponseEntity<MarketingCampaignDto> getCampaign(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getCampaign(id));
    }

    @PostMapping("/campaigns")
    @PreAuthorize("hasAuthority('MARKETING_ROI_WRITE')")
    public ResponseEntity<MarketingCampaignDto> createCampaign(@Valid @RequestBody CreateMarketingCampaignRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createCampaign(request));
    }

    @PutMapping("/campaigns/{id}")
    @PreAuthorize("hasAuthority('MARKETING_ROI_WRITE')")
    public ResponseEntity<MarketingCampaignDto> updateCampaign(@PathVariable UUID id, @Valid @RequestBody UpdateMarketingCampaignRequest request) {
        return ResponseEntity.ok(service.updateCampaign(id, request));
    }

    @DeleteMapping("/campaigns/{id}")
    @PreAuthorize("hasAuthority('MARKETING_ROI_WRITE')")
    public ResponseEntity<Void> deleteCampaign(@PathVariable UUID id) {
        service.deleteCampaign(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/campaigns/{id}/summary")
    @PreAuthorize("hasAuthority('MARKETING_ROI_READ')")
    public ResponseEntity<CampaignSummaryDto> getCampaignSummary(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getCampaignSummary(id));
    }

    @GetMapping("/roi/overview")
    @PreAuthorize("hasAuthority('MARKETING_ROI_READ')")
    public ResponseEntity<MarketingRoiOverviewDto> getRoiOverview() {
        return ResponseEntity.ok(service.getOverview());
    }
}
