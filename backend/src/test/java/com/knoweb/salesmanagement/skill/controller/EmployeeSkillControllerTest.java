package com.knoweb.salesmanagement.skill.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.knoweb.salesmanagement.common.exception.ResourceNotFoundException;
import com.knoweb.salesmanagement.skill.dto.AssignEmployeeSkillRequest;
import com.knoweb.salesmanagement.skill.dto.EmployeeSkillDTO;
import com.knoweb.salesmanagement.skill.enums.ProficiencyLevel;
import com.knoweb.salesmanagement.skill.service.EmployeeSkillService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.context.TestConfiguration;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EmployeeSkillController.class)
@TestPropertySource(properties = "knoweb.database.init.enabled=false")
@Import(EmployeeSkillControllerTest.TestSecurityConfig.class)
class EmployeeSkillControllerTest {

    @TestConfiguration
    @EnableMethodSecurity
    static class TestSecurityConfig {
    }

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EmployeeSkillService employeeSkillService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(authorities = "EMPLOYEE_SKILL_MANAGE")
    void assignSkill_validUuid_shouldReturn201() throws Exception {
        UUID employeeId = UUID.randomUUID();
        UUID skillId = UUID.randomUUID();
        AssignEmployeeSkillRequest request = new AssignEmployeeSkillRequest();
        request.setSkillId(skillId);
        request.setProficiencyLevel(ProficiencyLevel.INTERMEDIATE);

        Mockito.when(employeeSkillService.assignSkill(eq(employeeId), any(AssignEmployeeSkillRequest.class)))
                .thenReturn(new EmployeeSkillDTO());

        mockMvc.perform(post("/api/v1/employees/{employeeId}/skills", employeeId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(csrf()))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(authorities = "EMPLOYEE_SKILL_MANAGE")
    void assignSkill_invalidUuid_shouldReturn400() throws Exception {
        UUID employeeId = UUID.randomUUID();
        String invalidPayload = "{\"skillId\": \"0001\", \"proficiencyLevel\": \"INTERMEDIATE\"}";

        mockMvc.perform(post("/api/v1/employees/{employeeId}/skills", employeeId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidPayload)
                .with(csrf()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(authorities = "EMPLOYEE_SKILL_MANAGE")
    void assignSkill_missingSkill_shouldReturn404() throws Exception {
        UUID employeeId = UUID.randomUUID();
        UUID skillId = UUID.randomUUID();
        AssignEmployeeSkillRequest request = new AssignEmployeeSkillRequest();
        request.setSkillId(skillId);
        request.setProficiencyLevel(ProficiencyLevel.INTERMEDIATE);

        Mockito.when(employeeSkillService.assignSkill(eq(employeeId), any(AssignEmployeeSkillRequest.class)))
                .thenThrow(new ResourceNotFoundException("Skill not found"));

        mockMvc.perform(post("/api/v1/employees/{employeeId}/skills", employeeId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(csrf()))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(authorities = "EMPLOYEE_SKILL_MANAGE")
    void assignSkill_duplicateSkill_shouldReturn409() throws Exception {
        UUID employeeId = UUID.randomUUID();
        UUID skillId = UUID.randomUUID();
        AssignEmployeeSkillRequest request = new AssignEmployeeSkillRequest();
        request.setSkillId(skillId);
        request.setProficiencyLevel(ProficiencyLevel.INTERMEDIATE);

        Mockito.when(employeeSkillService.assignSkill(eq(employeeId), any(AssignEmployeeSkillRequest.class)))
                .thenThrow(new IllegalStateException("Employee already has this skill"));

        mockMvc.perform(post("/api/v1/employees/{employeeId}/skills", employeeId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(csrf()))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser
    void assignSkill_noPermission_shouldReturn403() throws Exception {
        UUID employeeId = UUID.randomUUID();
        UUID skillId = UUID.randomUUID();
        AssignEmployeeSkillRequest request = new AssignEmployeeSkillRequest();
        request.setSkillId(skillId);
        request.setProficiencyLevel(ProficiencyLevel.INTERMEDIATE);

        mockMvc.perform(post("/api/v1/employees/{employeeId}/skills", employeeId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(csrf()))
                .andExpect(status().isForbidden());
    }
}
