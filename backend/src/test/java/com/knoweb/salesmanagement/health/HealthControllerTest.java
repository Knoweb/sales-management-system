package com.knoweb.salesmanagement.health;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.TestPropertySource;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.is;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:postgresql://localhost:5432/sales_management",
    "spring.datasource.username=postgres",
    "spring.datasource.password=",
    "spring.flyway.enabled=true",
    "knoweb.database.init.enabled=false"
})
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void healthApi_shouldReturn200AndValidResponse() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UP")))
                .andExpect(jsonPath("$.application", is("sales-management-system")))
                .andExpect(jsonPath("$.timestamp", notNullValue()));
    }

    @Test
    void protectedEndpoint_shouldReturn401() throws Exception {
        // Any endpoint other than /api/v1/health is protected and should return 401
        mockMvc.perform(get("/api/v1/some-protected-data"))
                .andExpect(status().isUnauthorized());
    }
}
