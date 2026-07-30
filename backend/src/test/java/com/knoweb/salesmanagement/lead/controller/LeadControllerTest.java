package com.knoweb.salesmanagement.lead.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.knoweb.salesmanagement.config.SecurityConfig;
import com.knoweb.salesmanagement.lead.dto.LeadDTO;
import com.knoweb.salesmanagement.lead.dto.LeadRequest;
import com.knoweb.salesmanagement.lead.enums.InquirySource;
import com.knoweb.salesmanagement.lead.enums.LeadStatus;
import com.knoweb.salesmanagement.lead.service.LeadService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import com.knoweb.salesmanagement.security.jwt.JwtTokenProvider;
import com.knoweb.salesmanagement.security.principal.CustomUserDetailsService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@WebMvcTest(LeadController.class)
@Import(LeadControllerTest.TestSecurityConfig.class)
@TestPropertySource(properties = "knoweb.database.init.enabled=false")
class LeadControllerTest {

    @TestConfiguration
    @EnableMethodSecurity
    static class TestSecurityConfig {
        @Bean
        public com.fasterxml.jackson.databind.ObjectMapper objectMapper() {
            return new com.fasterxml.jackson.databind.ObjectMapper();
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private LeadService leadService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @WithMockUser(authorities = {"LEAD_UPDATE"})
    void updateLead_shouldReturn200_whenAuthorized() throws Exception {
        UUID leadId = UUID.randomUUID();
        LeadRequest request = new LeadRequest();
        request.setClientId(UUID.randomUUID());
        request.setTitle("Test Lead");
        request.setInquirySource(InquirySource.WEBSITE);
        request.setStatus(LeadStatus.NEW);
        
        LeadDTO dto = new LeadDTO();
        dto.setId(leadId);
        dto.setTitle("Test Lead");
        
        when(leadService.updateLead(eq(leadId), any(LeadRequest.class))).thenReturn(dto);

        mockMvc.perform(put("/api/v1/leads/{id}", leadId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = {"CLIENT_READ"}) // Missing LEAD_UPDATE
    void updateLead_shouldReturn403_whenUnauthorized() throws Exception {
        UUID leadId = UUID.randomUUID();
        LeadRequest request = new LeadRequest();
        request.setClientId(UUID.randomUUID());
        request.setTitle("Test Lead");
        request.setInquirySource(InquirySource.WEBSITE);
        request.setStatus(LeadStatus.NEW);

        mockMvc.perform(put("/api/v1/leads/{id}", leadId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = {"LEAD_UPDATE"})
    void updateLeadStatus_shouldReturn200_whenAuthorized() throws Exception {
        UUID leadId = UUID.randomUUID();
        com.knoweb.salesmanagement.lead.dto.LeadStatusRequest request = new com.knoweb.salesmanagement.lead.dto.LeadStatusRequest();
        request.setStatus(LeadStatus.CONTACTED);
        
        LeadDTO dto = new LeadDTO();
        dto.setId(leadId);
        dto.setStatus(LeadStatus.CONTACTED);
        
        when(leadService.updateLeadStatus(eq(leadId), any(com.knoweb.salesmanagement.lead.dto.LeadStatusRequest.class))).thenReturn(dto);

        mockMvc.perform(patch("/api/v1/leads/{id}/status", leadId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = {"LEAD_UPDATE"})
    void deactivateLead_shouldReturn200_whenAuthorized() throws Exception {
        UUID leadId = UUID.randomUUID();
        com.knoweb.salesmanagement.lead.dto.LeadStatusRequest request = new com.knoweb.salesmanagement.lead.dto.LeadStatusRequest();
        request.setActive(false);
        
        LeadDTO dto = new LeadDTO();
        dto.setId(leadId);
        dto.setActive(false);
        
        when(leadService.updateLeadStatus(eq(leadId), any(com.knoweb.salesmanagement.lead.dto.LeadStatusRequest.class))).thenReturn(dto);

        mockMvc.perform(patch("/api/v1/leads/{id}/status", leadId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = {"LEAD_UPDATE"})
    void reactivateLead_shouldReturn200_whenAuthorized() throws Exception {
        UUID leadId = UUID.randomUUID();
        com.knoweb.salesmanagement.lead.dto.LeadStatusRequest request = new com.knoweb.salesmanagement.lead.dto.LeadStatusRequest();
        request.setActive(true);
        
        LeadDTO dto = new LeadDTO();
        dto.setId(leadId);
        dto.setActive(true);
        
        when(leadService.updateLeadStatus(eq(leadId), any(com.knoweb.salesmanagement.lead.dto.LeadStatusRequest.class))).thenReturn(dto);

        mockMvc.perform(patch("/api/v1/leads/{id}/status", leadId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = {"CLIENT_READ"}) // Missing LEAD_UPDATE
    void updateLeadStatus_shouldReturn403_whenUnauthorized() throws Exception {
        UUID leadId = UUID.randomUUID();
        com.knoweb.salesmanagement.lead.dto.LeadStatusRequest request = new com.knoweb.salesmanagement.lead.dto.LeadStatusRequest();
        request.setActive(false);

        mockMvc.perform(patch("/api/v1/leads/{id}/status", leadId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = {"FOLLOW_UP_MANAGE"})
    void completeFollowUp_shouldReturn200_whenAuthorized() throws Exception {
        UUID leadId = UUID.randomUUID();
        UUID followUpId = UUID.randomUUID();
        com.knoweb.salesmanagement.lead.dto.FollowUpCompleteRequest request = new com.knoweb.salesmanagement.lead.dto.FollowUpCompleteRequest();
        request.setNotes("Done");
        
        com.knoweb.salesmanagement.lead.dto.FollowUpDTO dto = new com.knoweb.salesmanagement.lead.dto.FollowUpDTO();
        dto.setId(followUpId);
        
        when(leadService.completeFollowUp(eq(leadId), eq(followUpId), any(com.knoweb.salesmanagement.lead.dto.FollowUpCompleteRequest.class))).thenReturn(dto);

        mockMvc.perform(patch("/api/v1/leads/{id}/follow-ups/{followUpId}/complete", leadId, followUpId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = {"LEAD_READ"})
    void searchLeads_withNullSearch_shouldReturn200() throws Exception {
        Page<LeadDTO> page = new PageImpl<>(Collections.emptyList());
        when(leadService.searchLeads(eq(null), eq(null), eq(null), eq(null), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/v1/leads?page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @WithMockUser(authorities = {"LEAD_READ"})
    void searchLeads_withBlankSearch_shouldReturn200() throws Exception {
        Page<LeadDTO> page = new PageImpl<>(Collections.emptyList());
        when(leadService.searchLeads(eq("   "), eq(null), eq(null), eq(null), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/v1/leads?search=   &page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @WithMockUser(authorities = {"LEAD_READ"})
    void searchLeads_withTextSearch_shouldReturn200() throws Exception {
        Page<LeadDTO> page = new PageImpl<>(Collections.emptyList());
        when(leadService.searchLeads(eq("test"), eq(null), eq(null), eq(null), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/v1/leads?search=test&page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @WithMockUser(authorities = {"LEAD_READ"})
    void searchLeads_withValidStatusFilter_shouldReturn200() throws Exception {
        Page<LeadDTO> page = new PageImpl<>(Collections.emptyList());
        when(leadService.searchLeads(eq(null), eq(LeadStatus.NEW), eq(null), eq(null), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/v1/leads?status=NEW&page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @WithMockUser(authorities = {"LEAD_READ"})
    void searchLeads_withEmptyResult_shouldReturnEmptyPage() throws Exception {
        Page<LeadDTO> page = new PageImpl<>(Collections.emptyList());
        when(leadService.searchLeads(any(), any(), any(), any(), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/v1/leads?page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isEmpty())
                .andExpect(jsonPath("$.totalElements").value(0));
    }
}
