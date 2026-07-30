package com.knoweb.salesmanagement.health;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.is;

@WebMvcTest(HealthController.class)
@ActiveProfiles("test")
@Import({
    com.knoweb.salesmanagement.config.SecurityConfig.class,
    com.knoweb.salesmanagement.security.config.CustomAuthenticationEntryPoint.class,
    com.knoweb.salesmanagement.security.config.CustomAccessDeniedHandler.class
})
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private com.knoweb.salesmanagement.security.jwt.JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private com.knoweb.salesmanagement.security.principal.CustomUserDetailsService customUserDetailsService;

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
