package com.knoweb.salesmanagement.projectexecution.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.knoweb.salesmanagement.projectexecution.dto.SetupWorkspaceDTO;
import com.knoweb.salesmanagement.projectexecution.enums.ExecutionWorkspaceStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.UUID;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
public class ProjectExecutionSecurityTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    @WithMockUser(authorities = {"PROJECT_EXECUTION_READ"})
    void topManagementCanGetWorkspaces() throws Exception {
        mockMvc.perform(get("/api/v1/project-execution/workspaces"))
                .andExpect(status().isOk()); // Returns empty list or mocks, but isOk means no 403
    }

    @Test
    @WithMockUser(authorities = {"PROJECT_EXECUTION_READ"})
    void topManagementGets403ForSetupWorkspace() throws Exception {
        SetupWorkspaceDTO dto = new SetupWorkspaceDTO();
        dto.setStatus(ExecutionWorkspaceStatus.IN_PROGRESS);
        dto.setProjectManagerId(UUID.randomUUID());

        mockMvc.perform(put("/api/v1/project-execution/workspaces/" + UUID.randomUUID() + "/setup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = {"PROJECT_EXECUTION_WRITE"})
    void projectManagerCanSetupWorkspace_ButMayGet404Or400_Not403() throws Exception {
        SetupWorkspaceDTO dto = new SetupWorkspaceDTO();
        dto.setStatus(ExecutionWorkspaceStatus.IN_PROGRESS);
        dto.setProjectManagerId(UUID.randomUUID()); // to pass @Valid potentially

        try {
            mockMvc.perform(put("/api/v1/project-execution/workspaces/" + UUID.randomUUID() + "/setup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(result -> {
                        int s = result.getResponse().getStatus();
                        org.junit.jupiter.api.Assertions.assertNotEquals(403, s);
                    });
        } catch (Exception e) {
            // Unhandled RuntimeException results in 500, which throws an exception in MockMvc
            // We only care that it is NOT a 403 Access Denied.
            org.junit.jupiter.api.Assertions.assertTrue(e.getMessage().contains("Workspace not found") || e.getCause() instanceof RuntimeException);
        }
    }
}
