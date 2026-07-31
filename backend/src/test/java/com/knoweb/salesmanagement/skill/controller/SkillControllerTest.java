package com.knoweb.salesmanagement.skill.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.knoweb.salesmanagement.common.exception.ResourceNotFoundException;
import com.knoweb.salesmanagement.skill.dto.CreateSkillRequest;
import com.knoweb.salesmanagement.skill.dto.SkillDTO;
import com.knoweb.salesmanagement.skill.dto.UpdateSkillRequest;
import com.knoweb.salesmanagement.skill.service.SkillService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import com.knoweb.salesmanagement.security.jwt.JwtTokenProvider;
import com.knoweb.salesmanagement.security.principal.CustomUserDetailsService;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.context.annotation.Bean;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.context.TestConfiguration;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SkillController.class)
@TestPropertySource(properties = "knoweb.database.init.enabled=false")
@Import(SkillControllerTest.TestSecurityConfig.class)
class SkillControllerTest {

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

    @MockitoBean
    private SkillService skillService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(authorities = "SKILL_CATALOG_MANAGE")
    void createSkill_validRequest_shouldReturn201() throws Exception {
        CreateSkillRequest request = new CreateSkillRequest();
        request.setCode("JAVA_DEV");
        request.setName("Java Development");

        Mockito.when(skillService.createSkill(any(CreateSkillRequest.class)))
                .thenReturn(new SkillDTO());

        mockMvc.perform(post("/api/v1/skills")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(csrf()))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(authorities = "SKILL_CATALOG_MANAGE")
    void createSkill_duplicateCode_shouldReturn409() throws Exception {
        CreateSkillRequest request = new CreateSkillRequest();
        request.setCode("JAVA_DEV");
        request.setName("Java Development");

        Mockito.when(skillService.createSkill(any(CreateSkillRequest.class)))
                .thenThrow(new IllegalStateException("Skill code already exists: JAVA_DEV"));

        mockMvc.perform(post("/api/v1/skills")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(csrf()))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser
    void createSkill_noPermission_shouldReturn403() throws Exception {
        CreateSkillRequest request = new CreateSkillRequest();
        request.setCode("JAVA_DEV");
        request.setName("Java Development");

        mockMvc.perform(post("/api/v1/skills")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = "SKILL_CATALOG_MANAGE")
    void updateSkill_validRequest_shouldReturn200() throws Exception {
        UUID skillId = UUID.randomUUID();
        UpdateSkillRequest request = new UpdateSkillRequest();
        request.setName("Advanced Java Development");

        Mockito.when(skillService.updateSkill(eq(skillId), any(UpdateSkillRequest.class)))
                .thenReturn(new SkillDTO());

        mockMvc.perform(put("/api/v1/skills/{id}", skillId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "SKILL_CATALOG_MANAGE")
    void updateSkillStatus_validId_shouldReturn204() throws Exception {
        UUID skillId = UUID.randomUUID();
        
        mockMvc.perform(patch("/api/v1/skills/{id}/status", skillId)
                .with(csrf()))
                .andExpect(status().isNoContent());
        
        Mockito.verify(skillService, Mockito.times(1)).updateSkillStatus(skillId);
    }
}
