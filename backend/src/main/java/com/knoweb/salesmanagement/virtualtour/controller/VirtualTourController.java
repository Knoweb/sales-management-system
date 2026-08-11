package com.knoweb.salesmanagement.virtualtour.controller;

import com.knoweb.salesmanagement.virtualtour.dto.VirtualTourRequestDTO;
import com.knoweb.salesmanagement.virtualtour.dto.VirtualTourResponseDTO;
import com.knoweb.salesmanagement.virtualtour.enums.VirtualTourStatus;
import com.knoweb.salesmanagement.virtualtour.service.VirtualTourService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/virtual-tours")
public class VirtualTourController {

    private final VirtualTourService virtualTourService;

    public VirtualTourController(VirtualTourService virtualTourService) {
        this.virtualTourService = virtualTourService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('VIRTUAL_TOUR_CREATE')")
    public ResponseEntity<VirtualTourResponseDTO> createTour(@Valid @RequestBody VirtualTourRequestDTO request) {
        return new ResponseEntity<>(virtualTourService.createVirtualTour(request), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('VIRTUAL_TOUR_UPDATE')")
    public ResponseEntity<VirtualTourResponseDTO> updateTourStatus(
            @PathVariable UUID id, 
            @RequestParam VirtualTourStatus status) {
        return ResponseEntity.ok(virtualTourService.updateVirtualTourStatus(id, status));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('VIRTUAL_TOUR_UPDATE')")
    public ResponseEntity<VirtualTourResponseDTO> updateTour(
            @PathVariable UUID id, 
            @Valid @RequestBody VirtualTourRequestDTO request) {
        return ResponseEntity.ok(virtualTourService.updateVirtualTour(id, request));
    }

    @GetMapping("/lead/{leadId}")
    @PreAuthorize("hasAuthority('VIRTUAL_TOUR_READ')")
    public ResponseEntity<List<VirtualTourResponseDTO>> getToursByLead(@PathVariable UUID leadId) {
        return ResponseEntity.ok(virtualTourService.getToursByLead(leadId));
    }

    @GetMapping("/opportunity/{opportunityId}")
    @PreAuthorize("hasAuthority('VIRTUAL_TOUR_READ')")
    public ResponseEntity<List<VirtualTourResponseDTO>> getToursByOpportunity(@PathVariable UUID opportunityId) {
        return ResponseEntity.ok(virtualTourService.getToursByOpportunity(opportunityId));
    }

    @GetMapping("/upcoming")
    @PreAuthorize("hasAuthority('VIRTUAL_TOUR_READ')")
    public ResponseEntity<List<VirtualTourResponseDTO>> getUpcomingTours() {
        return ResponseEntity.ok(virtualTourService.getUpcomingTours());
    }

    @GetMapping("/analytics/effectiveness")
    @PreAuthorize("hasAuthority('VIRTUAL_TOUR_READ')")
    public ResponseEntity<com.knoweb.salesmanagement.virtualtour.dto.VirtualTourAnalyticsDTO> getCompletedToursCount() {
        return ResponseEntity.ok(virtualTourService.getVirtualTourEffectivenessMetrics());
    }
}
