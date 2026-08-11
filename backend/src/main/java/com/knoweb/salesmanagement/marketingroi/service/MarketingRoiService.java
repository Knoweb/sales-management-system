package com.knoweb.salesmanagement.marketingroi.service;

import com.knoweb.salesmanagement.lead.entity.Lead;
import com.knoweb.salesmanagement.lead.enums.LeadStatus;
import com.knoweb.salesmanagement.lead.repository.LeadRepository;
import com.knoweb.salesmanagement.marketingroi.dto.*;
import com.knoweb.salesmanagement.marketingroi.entity.MarketingCampaign;
import com.knoweb.salesmanagement.marketingroi.enums.MarketingPlatform;
import com.knoweb.salesmanagement.marketingroi.repository.MarketingCampaignRepository;
import com.knoweb.salesmanagement.audit.dto.InternalAuditLogEvent;
import org.springframework.context.ApplicationEventPublisher;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MarketingRoiService {

    private final MarketingCampaignRepository campaignRepository;
    private final LeadRepository leadRepository;
    private final ApplicationEventPublisher eventPublisher;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    public MarketingRoiService(MarketingCampaignRepository campaignRepository, LeadRepository leadRepository, ApplicationEventPublisher eventPublisher) {
        this.campaignRepository = campaignRepository;
        this.leadRepository = leadRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional(readOnly = true)
    public List<MarketingCampaignDto> getAllCampaigns() {
        return campaignRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MarketingCampaignDto getCampaign(UUID id) {
        return mapToDto(campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaign not found")));
    }

    @Transactional
    public MarketingCampaignDto createCampaign(CreateMarketingCampaignRequest request) {
        MarketingCampaign campaign = new MarketingCampaign();
        campaign.setName(request.getName());
        campaign.setPlatform(request.getPlatform());
        campaign.setStartDate(request.getStartDate());
        campaign.setEndDate(request.getEndDate());
        campaign.setObjective(request.getObjective());
        campaign.setMarketingCost(request.getMarketingCost() != null ? request.getMarketingCost() : BigDecimal.ZERO);
        campaign.setStatus(request.getStatus());
        campaign.setNotes(request.getNotes());

        MarketingCampaign saved = campaignRepository.save(campaign);
        MarketingCampaignDto dto = mapToDto(saved);

        InternalAuditLogEvent auditEvent = new InternalAuditLogEvent();
        auditEvent.setEventType("MARKETING_CAMPAIGN_CREATED");
        auditEvent.setEntityType("MarketingCampaign");
        auditEvent.setEntityId(saved.getId());
        auditEvent.setAction("CREATE");
        auditEvent.setNewState(dto);
        eventPublisher.publishEvent(auditEvent);

        return dto;
    }

    @Transactional
    public MarketingCampaignDto updateCampaign(UUID id, UpdateMarketingCampaignRequest request) {
        MarketingCampaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));

        campaign.setName(request.getName());
        campaign.setPlatform(request.getPlatform());
        campaign.setStartDate(request.getStartDate());
        campaign.setEndDate(request.getEndDate());
        campaign.setObjective(request.getObjective());
        campaign.setMarketingCost(request.getMarketingCost() != null ? request.getMarketingCost() : BigDecimal.ZERO);
        campaign.setStatus(request.getStatus());
        campaign.setNotes(request.getNotes());

        MarketingCampaignDto previousState = mapToDto(campaign);
        MarketingCampaign saved = campaignRepository.save(campaign);
        MarketingCampaignDto newState = mapToDto(saved);

        InternalAuditLogEvent auditEvent = new InternalAuditLogEvent();
        auditEvent.setEventType("MARKETING_CAMPAIGN_UPDATED");
        auditEvent.setEntityType("MarketingCampaign");
        auditEvent.setEntityId(saved.getId());
        auditEvent.setAction("UPDATE");
        auditEvent.setPreviousState(previousState);
        auditEvent.setNewState(newState);
        eventPublisher.publishEvent(auditEvent);

        return newState;
    }

    @Transactional
    public void deleteCampaign(UUID id) {
        MarketingCampaign campaign = campaignRepository.findById(id).orElse(null);
        if (campaign != null) {
            MarketingCampaignDto previousState = mapToDto(campaign);
            campaignRepository.deleteById(id);

            InternalAuditLogEvent auditEvent = new InternalAuditLogEvent();
            auditEvent.setEventType("MARKETING_CAMPAIGN_DELETED");
            auditEvent.setEntityType("MarketingCampaign");
            auditEvent.setEntityId(id);
            auditEvent.setAction("DELETE");
            auditEvent.setPreviousState(previousState);
            eventPublisher.publishEvent(auditEvent);
        }
    }

    @Transactional(readOnly = true)
    public CampaignSummaryDto getCampaignSummary(UUID campaignId) {
        MarketingCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));
        return calculateCampaignSummary(campaign);
    }

    @Transactional(readOnly = true)
    public MarketingRoiOverviewDto getOverview() {
        List<MarketingCampaign> campaigns = campaignRepository.findAll();
        
        MarketingRoiOverviewDto overview = new MarketingRoiOverviewDto();
        overview.setTotalCampaigns(campaigns.size());
        
        BigDecimal totalSpend = BigDecimal.ZERO;
        long totalLeads = 0;
        long totalQualified = 0;
        long totalConverted = 0;
        BigDecimal totalRevenue = BigDecimal.ZERO;

        List<PlatformComparisonDto> platforms = new ArrayList<>();

        for (MarketingPlatform platform : MarketingPlatform.values()) {
            List<MarketingCampaign> platformCampaigns = campaigns.stream()
                    .filter(c -> c.getPlatform() == platform)
                    .collect(Collectors.toList());

            if (!platformCampaigns.isEmpty()) {
                PlatformComparisonDto pDto = new PlatformComparisonDto();
                pDto.setPlatform(platform);
                pDto.setTotalCampaigns(platformCampaigns.size());
                
                BigDecimal pSpend = BigDecimal.ZERO;
                long pLeads = 0;
                long pQualified = 0;
                long pConverted = 0;
                BigDecimal pRevenue = BigDecimal.ZERO;

                for (MarketingCampaign pc : platformCampaigns) {
                    CampaignSummaryDto summary = calculateCampaignSummary(pc);
                    pSpend = pSpend.add(summary.getMarketingCost());
                    pLeads += summary.getGeneratedLeads();
                    pQualified += summary.getQualifiedLeads();
                    pConverted += summary.getConvertedClients();
                    pRevenue = pRevenue.add(summary.getAttributedRevenue());
                }

                pDto.setTotalMarketingCost(pSpend);
                pDto.setGeneratedLeads(pLeads);
                pDto.setQualifiedLeads(pQualified);
                pDto.setConvertedClients(pConverted);
                pDto.setAttributedRevenue(pRevenue);

                pDto.setCostPerLead(calculateCpl(pSpend, pLeads));
                pDto.setCostPerCustomer(calculateCpc(pSpend, pConverted));
                pDto.setRoiPercentage(calculateRoi(pRevenue, pSpend));

                platforms.add(pDto);

                totalSpend = totalSpend.add(pSpend);
                totalLeads += pLeads;
                totalQualified += pQualified;
                totalConverted += pConverted;
                totalRevenue = totalRevenue.add(pRevenue);
            }
        }

        overview.setTotalMarketingSpend(totalSpend);
        overview.setGeneratedLeads(totalLeads);
        overview.setQualifiedLeads(totalQualified);
        overview.setConvertedClients(totalConverted);
        overview.setAttributedRevenue(totalRevenue);
        overview.setOverallRoi(calculateRoi(totalRevenue, totalSpend));
        overview.setPlatformComparisons(platforms);

        return overview;
    }

    private CampaignSummaryDto calculateCampaignSummary(MarketingCampaign campaign) {
        CampaignSummaryDto dto = new CampaignSummaryDto();
        dto.setCampaignId(campaign.getId());
        dto.setCampaignName(campaign.getName());
        dto.setPlatform(campaign.getPlatform());
        dto.setStartDate(campaign.getStartDate());
        dto.setEndDate(campaign.getEndDate());
        dto.setStatus(campaign.getStatus());
        dto.setMarketingCost(campaign.getMarketingCost());

        // Calculate counts
        Long generatedLeads = (Long) entityManager.createQuery(
                "SELECT COUNT(l) FROM Lead l WHERE l.marketingCampaign.id = :campaignId")
                .setParameter("campaignId", campaign.getId())
                .getSingleResult();

        Long qualifiedLeads = (Long) entityManager.createQuery(
                "SELECT COUNT(l) FROM Lead l WHERE l.marketingCampaign.id = :campaignId AND l.status = :status")
                .setParameter("campaignId", campaign.getId())
                .setParameter("status", LeadStatus.QUALIFIED)
                .getSingleResult();

        Long convertedClients = (Long) entityManager.createQuery(
                "SELECT COUNT(l) FROM Lead l WHERE l.marketingCampaign.id = :campaignId AND l.status = :status")
                .setParameter("campaignId", campaign.getId())
                .setParameter("status", LeadStatus.CLOSED_WON)
                .getSingleResult();

        // Calculate revenue via Quoation final_total
        String revenueJpql = "SELECT COALESCE(SUM(q.finalTotal), 0) FROM Quotation q " +
                "JOIN ConsolidatedTechnicalEstimate e ON q.approvedEstimateId = e.id " +
                "JOIN TechnicalProject tp ON e.technicalProject = tp " +
                "JOIN SalesOpportunity so ON tp.salesOpportunity = so " +
                "JOIN Lead l ON so.lead = l " +
                "WHERE l.marketingCampaign.id = :campaignId " +
                "AND q.status = com.knoweb.salesmanagement.quotation.enums.QuotationStatus.CLIENT_ACCEPTED";

        BigDecimal attributedRevenue = (BigDecimal) entityManager.createQuery(revenueJpql)
                .setParameter("campaignId", campaign.getId())
                .getSingleResult();

        dto.setGeneratedLeads(generatedLeads);
        dto.setQualifiedLeads(qualifiedLeads);
        dto.setConvertedClients(convertedClients);
        dto.setAttributedRevenue(attributedRevenue);

        dto.setCostPerLead(calculateCpl(campaign.getMarketingCost(), generatedLeads));
        dto.setCostPerCustomer(calculateCpc(campaign.getMarketingCost(), convertedClients));
        dto.setRoiPercentage(calculateRoi(attributedRevenue, campaign.getMarketingCost()));

        return dto;
    }

    private BigDecimal calculateCpl(BigDecimal cost, long leads) {
        if (leads == 0) return null;
        return cost.divide(BigDecimal.valueOf(leads), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateCpc(BigDecimal cost, long clients) {
        if (clients == 0) return null;
        return cost.divide(BigDecimal.valueOf(clients), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateRoi(BigDecimal revenue, BigDecimal cost) {
        if (cost == null || cost.compareTo(BigDecimal.ZERO) == 0) return null;
        return revenue.subtract(cost).divide(cost, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP);
    }

    private MarketingCampaignDto mapToDto(MarketingCampaign entity) {
        MarketingCampaignDto dto = new MarketingCampaignDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setPlatform(entity.getPlatform());
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setObjective(entity.getObjective());
        dto.setMarketingCost(entity.getMarketingCost());
        dto.setStatus(entity.getStatus());
        dto.setNotes(entity.getNotes());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
