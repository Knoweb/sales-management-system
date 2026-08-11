package com.knoweb.salesmanagement.quotation.service;

import com.knoweb.salesmanagement.quotation.dto.QuotationDto;
import com.knoweb.salesmanagement.quotation.entity.Quotation;
import com.knoweb.salesmanagement.quotation.repository.QuotationRepository;
import com.knoweb.salesmanagement.quotation.repository.QuotationApprovalHistoryRepository;
import com.knoweb.salesmanagement.security.principal.CustomUserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class QuotationService {

    private final QuotationRepository quotationRepository;
    private final QuotationApprovalHistoryRepository approvalHistoryRepository;
    private final com.knoweb.salesmanagement.user.repository.UserRepository userRepository;

    public QuotationService(QuotationRepository quotationRepository, 
                            QuotationApprovalHistoryRepository approvalHistoryRepository,
                            com.knoweb.salesmanagement.user.repository.UserRepository userRepository) {
        this.quotationRepository = quotationRepository;
        this.approvalHistoryRepository = approvalHistoryRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<QuotationDto> getAllQuotations() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean canReadDrafts = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("QUOTATION_READ"));

        return quotationRepository.findAll().stream()
                .filter(q -> canReadDrafts || q.getStatus() != com.knoweb.salesmanagement.quotation.enums.QuotationStatus.DRAFT)
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QuotationDto getQuotationById(UUID id) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));
        return mapToDto(quotation);
    }

    @Transactional
    public QuotationDto createQuotation(QuotationDto request) {
        Quotation quotation = new Quotation();
        quotation.setQuotationNumber("QT-" + System.currentTimeMillis());
        quotation.setApprovedEstimateId(request.getApprovedEstimateId());
        quotation.setClientDetails(request.getClientDetails());
        quotation.setProjectTitle(request.getProjectTitle());
        quotation.setProjectDescription(request.getProjectDescription());
        quotation.setScopeOfWork(request.getScopeOfWork());
        quotation.setSubtotal(request.getSubtotal());
        quotation.setTaxAmount(request.getTaxAmount());
        quotation.setDiscountAmount(request.getDiscountAmount());
        quotation.setFinalTotal(request.getFinalTotal());
        quotation.setPaymentTerms(request.getPaymentTerms());
        quotation.setDeliveryPeriod(request.getDeliveryPeriod());
        quotation.setWarrantyInformation(request.getWarrantyInformation());
        quotation.setValidityPeriod(request.getValidityPeriod());
        quotation.setTermsAndConditions(request.getTermsAndConditions());
        
        quotation.setStatus(com.knoweb.salesmanagement.quotation.enums.QuotationStatus.DRAFT);

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails) {
            UUID userId = ((CustomUserDetails) auth.getPrincipal()).getId();
            quotation.setCreatedBy(userId);
        }

        if (request.getItems() != null) {
            for (com.knoweb.salesmanagement.quotation.dto.QuotationItemDto itemDto : request.getItems()) {
                com.knoweb.salesmanagement.quotation.entity.QuotationItem item = new com.knoweb.salesmanagement.quotation.entity.QuotationItem();
                item.setQuotation(quotation);
                item.setDescription(itemDto.getDescription());
                item.setQuantity(itemDto.getQuantity());
                item.setUnitPrice(itemDto.getUnitPrice());
                item.setLineTotal(itemDto.getLineTotal());
                quotation.getItems().add(item);
            }
        }

        Quotation saved = quotationRepository.save(quotation);
        return mapToDto(saved);
    }

    @Transactional
    public QuotationDto updateQuotation(UUID id, QuotationDto request) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));

        if (quotation.getStatus() != com.knoweb.salesmanagement.quotation.enums.QuotationStatus.DRAFT && 
            quotation.getStatus() != com.knoweb.salesmanagement.quotation.enums.QuotationStatus.RETURNED_FOR_CORRECTION) {
            throw new RuntimeException("Only Draft or Returned quotations can be edited.");
        }

        quotation.setClientDetails(request.getClientDetails());
        quotation.setProjectTitle(request.getProjectTitle());
        quotation.setProjectDescription(request.getProjectDescription());
        quotation.setScopeOfWork(request.getScopeOfWork());
        quotation.setSubtotal(request.getSubtotal());
        quotation.setTaxAmount(request.getTaxAmount());
        quotation.setDiscountAmount(request.getDiscountAmount());
        quotation.setFinalTotal(request.getFinalTotal());
        quotation.setPaymentTerms(request.getPaymentTerms());
        quotation.setDeliveryPeriod(request.getDeliveryPeriod());
        quotation.setWarrantyInformation(request.getWarrantyInformation());
        quotation.setValidityPeriod(request.getValidityPeriod());
        quotation.setTermsAndConditions(request.getTermsAndConditions());

        // Clear existing items and re-add
        quotation.getItems().clear();
        if (request.getItems() != null) {
            for (com.knoweb.salesmanagement.quotation.dto.QuotationItemDto itemDto : request.getItems()) {
                com.knoweb.salesmanagement.quotation.entity.QuotationItem item = new com.knoweb.salesmanagement.quotation.entity.QuotationItem();
                item.setQuotation(quotation);
                item.setDescription(itemDto.getDescription());
                item.setQuantity(itemDto.getQuantity());
                item.setUnitPrice(itemDto.getUnitPrice());
                item.setLineTotal(itemDto.getLineTotal());
                quotation.getItems().add(item);
            }
        }

        Quotation saved = quotationRepository.save(quotation);
        return mapToDto(saved);
    }

    @Transactional
    public QuotationDto submitForTopManagementApproval(UUID id) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));
        
        if (quotation.getStatus() != com.knoweb.salesmanagement.quotation.enums.QuotationStatus.DRAFT && 
            quotation.getStatus() != com.knoweb.salesmanagement.quotation.enums.QuotationStatus.RETURNED_FOR_CORRECTION) {
            throw new RuntimeException("Quotation is not in a valid state to be submitted.");
        }
        
        quotation.setStatus(com.knoweb.salesmanagement.quotation.enums.QuotationStatus.PENDING_TOP_MANAGEMENT_APPROVAL);
        Quotation saved = quotationRepository.save(quotation);
        
        recordApprovalHistory(saved, "SUBMIT_FOR_APPROVAL", "Submitted for top management approval");
        
        return mapToDto(saved);
    }

    @Transactional
    public QuotationDto processTopManagementApproval(UUID id, com.knoweb.salesmanagement.quotation.dto.QuotationApprovalDto request) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));
                
        if (quotation.getStatus() != com.knoweb.salesmanagement.quotation.enums.QuotationStatus.PENDING_TOP_MANAGEMENT_APPROVAL) {
            throw new RuntimeException("Quotation is not pending approval.");
        }
        
        String action = request.getAction();
        switch (action) {
            case "APPROVE":
                quotation.setStatus(com.knoweb.salesmanagement.quotation.enums.QuotationStatus.APPROVED_BY_TOP_MANAGEMENT);
                break;
            case "REJECT":
                quotation.setStatus(com.knoweb.salesmanagement.quotation.enums.QuotationStatus.REJECTED_BY_TOP_MANAGEMENT);
                break;
            case "RETURN":
            case "REVISE":
                quotation.setStatus(com.knoweb.salesmanagement.quotation.enums.QuotationStatus.RETURNED_FOR_CORRECTION);
                break;
            default:
                throw new RuntimeException("Invalid action.");
        }
        
        Quotation saved = quotationRepository.save(quotation);
        recordApprovalHistory(saved, action, request.getComments());
        
        return mapToDto(saved);
    }

    @Transactional
    public QuotationDto markAsSentToClient(UUID id) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));
                
        if (quotation.getStatus() != com.knoweb.salesmanagement.quotation.enums.QuotationStatus.APPROVED_BY_TOP_MANAGEMENT) {
            throw new RuntimeException("Quotation must be approved by top management before sending to client.");
        }
        
        quotation.setStatus(com.knoweb.salesmanagement.quotation.enums.QuotationStatus.PENDING_CLIENT_APPROVAL);
        return mapToDto(quotationRepository.save(quotation));
    }

    @Transactional
    public QuotationDto updateClientDecision(UUID id, com.knoweb.salesmanagement.quotation.dto.ClientDecisionDto request) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));
                
        if (quotation.getStatus() != com.knoweb.salesmanagement.quotation.enums.QuotationStatus.PENDING_CLIENT_APPROVAL) {
            throw new RuntimeException("Quotation is not pending client approval.");
        }
        
        String action = request.getAction();
        switch (action) {
            case "ACCEPT":
                quotation.setStatus(com.knoweb.salesmanagement.quotation.enums.QuotationStatus.CLIENT_ACCEPTED);
                break;
            case "REJECT":
                quotation.setStatus(com.knoweb.salesmanagement.quotation.enums.QuotationStatus.CLIENT_REJECTED);
                break;
            case "REVISE":
            case "DISCOUNT":
                quotation.setStatus(com.knoweb.salesmanagement.quotation.enums.QuotationStatus.CLIENT_REQUESTED_REVISION);
                break;
            case "NEGOTIATE":
                quotation.setStatus(com.knoweb.salesmanagement.quotation.enums.QuotationStatus.IN_NEGOTIATION);
                break;
            case "DELAY":
                quotation.setStatus(com.knoweb.salesmanagement.quotation.enums.QuotationStatus.DECISION_DELAYED);
                break;
            default:
                throw new RuntimeException("Invalid client decision action.");
        }
        
        Quotation saved = quotationRepository.save(quotation);
        
        // Record the decision in the history
        recordApprovalHistory(saved, "CLIENT_" + action, request.getComments());
        
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<com.knoweb.salesmanagement.quotation.dto.QuotationApprovalHistoryDto> getApprovalHistory(UUID quotationId) {
        return approvalHistoryRepository.findByQuotationIdOrderByCreatedAtDesc(quotationId).stream().map(history -> {
            com.knoweb.salesmanagement.quotation.dto.QuotationApprovalHistoryDto dto = new com.knoweb.salesmanagement.quotation.dto.QuotationApprovalHistoryDto();
            dto.setId(history.getId().toString());
            dto.setAction(history.getAction());
            dto.setComments(history.getComments());
            dto.setCreatedBy(history.getCreatedBy().toString());
            dto.setCreatedAt(history.getCreatedAt());
            
            userRepository.findById(history.getCreatedBy()).ifPresent(user -> {
                dto.setCreatedByName(user.getFirstName() + " " + user.getLastName());
            });
            
            return dto;
        }).collect(Collectors.toList());
    }

    private void recordApprovalHistory(Quotation quotation, String action, String comments) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        UUID userId = null;
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails) {
            userId = ((CustomUserDetails) auth.getPrincipal()).getId();
        } else {
            throw new RuntimeException("Could not determine current user.");
        }
        
        com.knoweb.salesmanagement.quotation.entity.QuotationApprovalHistory history = new com.knoweb.salesmanagement.quotation.entity.QuotationApprovalHistory();
        history.setQuotation(quotation);
        history.setAction(action);
        history.setComments(comments);
        history.setCreatedBy(userId);
        
        approvalHistoryRepository.save(history);
    }

    private QuotationDto mapToDto(Quotation entity) {
        QuotationDto dto = new QuotationDto();
        dto.setId(entity.getId());
        dto.setQuotationNumber(entity.getQuotationNumber());
        dto.setVersion(entity.getVersion());
        dto.setApprovedEstimateId(entity.getApprovedEstimateId());
        dto.setClientDetails(entity.getClientDetails());
        dto.setProjectTitle(entity.getProjectTitle());
        dto.setProjectDescription(entity.getProjectDescription());
        dto.setScopeOfWork(entity.getScopeOfWork());
        dto.setSubtotal(entity.getSubtotal());
        dto.setTaxAmount(entity.getTaxAmount());
        dto.setDiscountAmount(entity.getDiscountAmount());
        dto.setFinalTotal(entity.getFinalTotal());
        dto.setPaymentTerms(entity.getPaymentTerms());
        dto.setDeliveryPeriod(entity.getDeliveryPeriod());
        dto.setWarrantyInformation(entity.getWarrantyInformation());
        dto.setValidityPeriod(entity.getValidityPeriod());
        dto.setTermsAndConditions(entity.getTermsAndConditions());
        
        if (entity.getStatus() != null) {
            dto.setStatus(com.knoweb.salesmanagement.quotation.enums.QuotationStatus.valueOf(entity.getStatus().name()));
        }
        
        if (entity.getItems() != null) {
            List<com.knoweb.salesmanagement.quotation.dto.QuotationItemDto> itemDtos = entity.getItems().stream().map(item -> {
                com.knoweb.salesmanagement.quotation.dto.QuotationItemDto itemDto = new com.knoweb.salesmanagement.quotation.dto.QuotationItemDto();
                itemDto.setId(item.getId());
                itemDto.setDescription(item.getDescription());
                itemDto.setQuantity(item.getQuantity());
                itemDto.setUnitPrice(item.getUnitPrice());
                itemDto.setLineTotal(item.getLineTotal());
                return itemDto;
            }).collect(Collectors.toList());
            dto.setItems(itemDtos);
        }
        
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
