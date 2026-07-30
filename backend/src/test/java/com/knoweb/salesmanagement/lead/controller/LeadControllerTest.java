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
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
}
