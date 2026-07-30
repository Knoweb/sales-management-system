package com.knoweb.salesmanagement.client.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.knoweb.salesmanagement.client.dto.*;
import com.knoweb.salesmanagement.client.enums.ClientType;
import com.knoweb.salesmanagement.client.service.ClientService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import com.knoweb.salesmanagement.security.jwt.JwtTokenProvider;
import com.knoweb.salesmanagement.security.principal.CustomUserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ClientController.class)
@Import(ClientControllerTest.TestSecurityConfig.class)
class ClientControllerTest {

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
    private ClientService clientService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    private UUID clientId;
    private ClientDTO clientDTO;

    @BeforeEach
    void setUp() {
        clientId = UUID.randomUUID();
        clientDTO = new ClientDTO();
        clientDTO.setId(clientId);
        clientDTO.setName("Test Client");
        clientDTO.setClientType(ClientType.COMPANY);
    }

    @Test
    @WithMockUser(authorities = "CLIENT_CREATE")
    void createClient_Success() throws Exception {
        ClientRequest request = new ClientRequest();
        request.setName("Test Client");
        request.setClientType(ClientType.COMPANY);

        Mockito.when(clientService.createClient(any(), eq(false))).thenReturn(clientDTO);

        mockMvc.perform(post("/api/v1/clients")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists());
    }

    @Test
    @WithMockUser(authorities = "CLIENT_READ")
    void createClient_Forbidden() throws Exception {
        ClientRequest request = new ClientRequest();
        request.setName("Test Client");
        request.setClientType(ClientType.COMPANY);

        mockMvc.perform(post("/api/v1/clients")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = "CLIENT_READ")
    void searchClients_EmptyList_Returns200() throws Exception {
        PageImpl<ClientSummaryDTO> emptyPage = new PageImpl<>(List.of());
        Mockito.when(clientService.searchClients(any(), any(), any())).thenReturn(emptyPage);

        mockMvc.perform(get("/api/v1/clients?page=0&size=10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isEmpty())
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    @WithMockUser(authorities = "CLIENT_READ")
    void searchClients_Paginated_Returns200() throws Exception {
        ClientSummaryDTO summary = new ClientSummaryDTO();
        summary.setId(clientId);
        summary.setName("Test Client");
        PageImpl<ClientSummaryDTO> page = new PageImpl<>(List.of(summary));
        Mockito.when(clientService.searchClients(any(), any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/v1/clients?page=0&size=10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(clientId.toString()))
                .andExpect(jsonPath("$.content[0].name").value("Test Client"));
    }

    @Test
    @WithMockUser(authorities = "CLIENT_READ")
    void searchClients_WithSearchQuery_Returns200() throws Exception {
        PageImpl<ClientSummaryDTO> page = new PageImpl<>(List.of());
        Mockito.when(clientService.searchClients(eq("test"), any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/v1/clients?search=test&page=0&size=10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "OTHER_ROLE")
    void searchClients_PermissionMissing_Returns403() throws Exception {
        mockMvc.perform(get("/api/v1/clients?page=0&size=10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }
}
