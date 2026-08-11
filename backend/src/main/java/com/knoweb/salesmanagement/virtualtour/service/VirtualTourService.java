package com.knoweb.salesmanagement.virtualtour.service;

import com.knoweb.salesmanagement.common.exception.ResourceNotFoundException;
import com.knoweb.salesmanagement.employee.repository.EmployeeRepository;
import com.knoweb.salesmanagement.lead.repository.LeadRepository;
import com.knoweb.salesmanagement.opportunity.repository.SalesOpportunityRepository;
import com.knoweb.salesmanagement.virtualtour.dto.VirtualTourRequestDTO;
import com.knoweb.salesmanagement.virtualtour.dto.VirtualTourResponseDTO;
import com.knoweb.salesmanagement.virtualtour.entity.VirtualTour;
import com.knoweb.salesmanagement.virtualtour.enums.VirtualTourStatus;
import com.knoweb.salesmanagement.virtualtour.repository.VirtualTourRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class VirtualTourService {

    private final VirtualTourRepository virtualTourRepository;
    private final LeadRepository leadRepository;
    private final SalesOpportunityRepository opportunityRepository;
    private final EmployeeRepository employeeRepository;

    public VirtualTourService(VirtualTourRepository virtualTourRepository,
                              LeadRepository leadRepository,
                              SalesOpportunityRepository opportunityRepository,
                              EmployeeRepository employeeRepository) {
        this.virtualTourRepository = virtualTourRepository;
        this.leadRepository = leadRepository;
        this.opportunityRepository = opportunityRepository;
        this.employeeRepository = employeeRepository;
    }

    public VirtualTourResponseDTO createVirtualTour(VirtualTourRequestDTO request) {
        VirtualTour tour = new VirtualTour();
        
        if (request.getLeadId() != null) {
            tour.setLead(leadRepository.findById(request.getLeadId())
                    .orElseThrow(() -> new ResourceNotFoundException("Lead not found")));
        }
        
        if (request.getOpportunityId() != null) {
            tour.setOpportunity(opportunityRepository.findById(request.getOpportunityId())
                    .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found")));
        }
        
        if (request.getConductedBy() != null) {
            tour.setConductedBy(employeeRepository.findById(request.getConductedBy())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found")));
        }

        tour.setPlatform(request.getPlatform());
        tour.setTourDate(request.getTourDate());
        tour.setNotes(request.getNotes());
        tour.setStatus(request.getStatus() != null ? request.getStatus() : VirtualTourStatus.SCHEDULED);
        tour.setLanguage(request.getLanguage());
        tour.setDemonstratedProduct(request.getDemonstratedProduct());
        tour.setClientResponse(request.getClientResponse());
        tour.setProbabilityBefore(request.getProbabilityBefore());
        tour.setProbabilityAfter(request.getProbabilityAfter());
        tour.setFollowUpRequired(request.getFollowUpRequired());

        tour = virtualTourRepository.save(tour);
        return mapToDTO(tour);
    }

    public VirtualTourResponseDTO updateVirtualTour(UUID id, VirtualTourRequestDTO request) {
        VirtualTour tour = virtualTourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Virtual tour not found"));
        
        if (request.getPlatform() != null) tour.setPlatform(request.getPlatform());
        if (request.getTourDate() != null) tour.setTourDate(request.getTourDate());
        if (request.getNotes() != null) tour.setNotes(request.getNotes());
        if (request.getStatus() != null) tour.setStatus(request.getStatus());
        if (request.getLanguage() != null) tour.setLanguage(request.getLanguage());
        if (request.getDemonstratedProduct() != null) tour.setDemonstratedProduct(request.getDemonstratedProduct());
        if (request.getClientResponse() != null) tour.setClientResponse(request.getClientResponse());
        if (request.getProbabilityBefore() != null) tour.setProbabilityBefore(request.getProbabilityBefore());
        if (request.getProbabilityAfter() != null) tour.setProbabilityAfter(request.getProbabilityAfter());
        if (request.getFollowUpRequired() != null) tour.setFollowUpRequired(request.getFollowUpRequired());
        
        return mapToDTO(virtualTourRepository.save(tour));
    }

    public VirtualTourResponseDTO updateVirtualTourStatus(UUID id, VirtualTourStatus newStatus) {
        VirtualTour tour = virtualTourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Virtual tour not found"));
        tour.setStatus(newStatus);
        return mapToDTO(virtualTourRepository.save(tour));
    }

    @Transactional(readOnly = true)
    public List<VirtualTourResponseDTO> getToursByLead(UUID leadId) {
        return virtualTourRepository.findByLeadIdOrderByTourDateDesc(leadId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VirtualTourResponseDTO> getToursByOpportunity(UUID opportunityId) {
        return virtualTourRepository.findByOpportunityIdOrderByTourDateDesc(opportunityId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VirtualTourResponseDTO> getUpcomingTours() {
        return virtualTourRepository.findUpcomingTours(VirtualTourStatus.SCHEDULED, OffsetDateTime.now())
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private VirtualTourResponseDTO mapToDTO(VirtualTour tour) {
        VirtualTourResponseDTO dto = new VirtualTourResponseDTO();
        dto.setId(tour.getId());
        if (tour.getLead() != null) {
            dto.setLeadId(tour.getLead().getId());
            dto.setTargetType("LEAD");
            dto.setTargetName(tour.getLead().getTitle());
        }
        if (tour.getOpportunity() != null) {
            dto.setOpportunityId(tour.getOpportunity().getId());
            dto.setTargetType("OPPORTUNITY");
            dto.setTargetName(tour.getOpportunity().getTitle());
        }
        dto.setPlatform(tour.getPlatform());
        dto.setStatus(tour.getStatus());
        dto.setTourDate(tour.getTourDate());
        dto.setNotes(tour.getNotes());
        dto.setLanguage(tour.getLanguage());
        dto.setDemonstratedProduct(tour.getDemonstratedProduct());
        dto.setClientResponse(tour.getClientResponse());
        dto.setProbabilityBefore(tour.getProbabilityBefore());
        dto.setProbabilityAfter(tour.getProbabilityAfter());
        dto.setFollowUpRequired(tour.getFollowUpRequired());
        
        if (tour.getConductedBy() != null) {
            dto.setConductedById(tour.getConductedBy().getId());
            dto.setConductedByName(tour.getConductedBy().getFirstName() + " " + tour.getConductedBy().getLastName());
        }
        dto.setCreatedAt(tour.getCreatedAt());
        dto.setUpdatedAt(tour.getUpdatedAt());
        return dto;
    }

    @Transactional(readOnly = true)
    public com.knoweb.salesmanagement.virtualtour.dto.VirtualTourAnalyticsDTO getVirtualTourEffectivenessMetrics() {
        OffsetDateTime endDate = OffsetDateTime.now();
        OffsetDateTime startDate = endDate.minusDays(30);
        
        List<VirtualTour> completedTours = virtualTourRepository.findByStatusAndDateRange(VirtualTourStatus.COMPLETED, startDate, endDate);
        
        long count = completedTours.size();
        double averageIncrease = 0.0;
        
        if (count > 0) {
            double totalIncrease = 0.0;
            int validRecords = 0;
            for (VirtualTour tour : completedTours) {
                if (tour.getProbabilityBefore() != null && tour.getProbabilityAfter() != null) {
                    totalIncrease += (tour.getProbabilityAfter() - tour.getProbabilityBefore());
                    validRecords++;
                }
            }
            if (validRecords > 0) {
                averageIncrease = totalIncrease / validRecords;
            }
        }
        
        return new com.knoweb.salesmanagement.virtualtour.dto.VirtualTourAnalyticsDTO(count, averageIncrease);
    }
}
