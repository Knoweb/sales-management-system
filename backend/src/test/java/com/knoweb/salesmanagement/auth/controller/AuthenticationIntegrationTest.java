package com.knoweb.salesmanagement.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.knoweb.salesmanagement.auth.dto.LoginRequest;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class AuthenticationIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Value("${INITIAL_ADMIN_EMAIL:admin@knoweb.lk}")
    private String adminEmail;

    @Value("${INITIAL_ADMIN_PASSWORD:Admin1234}")
    private String adminPassword;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    public void setup() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @Test
    public void testAdminBootstrappedCorrectly() {
        // Assert that InitialAdminBootstrap ran and created the user
        User admin = userRepository.findByEmail(adminEmail.toLowerCase())
                .orElseThrow(() -> new AssertionError("Admin user was not bootstrapped"));
        
        assertTrue(admin.isActive());
        assertFalse(admin.isLocked());
        assertEquals("System", admin.getFirstName());
        assertEquals("Administrator", admin.getLastName());
        
        // Assert role assignment
        boolean hasSystemAdminRole = admin.getRoles().stream()
                .anyMatch(role -> "SYSTEM_ADMIN".equals(role.getCode()));
        assertTrue(hasSystemAdminRole, "Admin user must have SYSTEM_ADMIN role");
    }

    @Test
    public void testLoginSuccess() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail(adminEmail);
        request.setPassword(adminPassword);

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value(adminEmail.toLowerCase()))
                .andExpect(cookie().exists("refreshToken"));
    }

    @Test
    public void testLoginFailure_BadPassword() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail(adminEmail);
        request.setPassword("wrongpassword");

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(cookie().doesNotExist("refreshToken"));
    }

    @Test
    public void testLoginFailure_BadUser() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("doesnotexist@knoweb.lk");
        request.setPassword(adminPassword);

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(cookie().doesNotExist("refreshToken"));
    }

    @Test
    public void testAuthorityVerification_Unauthenticated() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Autowired
    private com.knoweb.salesmanagement.config.InitialAdminBootstrap initialAdminBootstrap;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Test
    public void testForcePasswordResetFlow() throws Exception {
        // 1. Create hod.test@knoweb.lk to verify HOD is unaffected
        User hodUser = userRepository.findByEmail("hod.test@knoweb.lk").orElseGet(() -> {
            User u = new User();
            u.setEmail("hod.test@knoweb.lk");
            u.setFirstName("HOD");
            u.setLastName("Test");
            u.setPasswordHash(passwordEncoder.encode("Hod1234"));
            u.setActive(true);
            u.setLocked(false);
            return userRepository.save(u);
        });
        String originalHodHash = hodUser.getPasswordHash();

        // 2. Corrupt/change admin password to simulate mismatch (401)
        User admin = userRepository.findByEmail(adminEmail.toLowerCase())
                .orElseThrow(() -> new AssertionError("Admin user not found"));
        admin.setPasswordHash(passwordEncoder.encode("wrong_old_password"));
        userRepository.save(admin);

        LoginRequest req = new LoginRequest();
        req.setEmail(adminEmail);
        req.setPassword(adminPassword);
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());

        // 3. Set flag=true and run bootstrap
        org.springframework.test.util.ReflectionTestUtils.setField(initialAdminBootstrap, "forcePasswordReset", true);
        initialAdminBootstrap.run(null);

        // Verify admin login returns 200
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty());

        // 4. Set flag=false and run bootstrap again
        org.springframework.test.util.ReflectionTestUtils.setField(initialAdminBootstrap, "forcePasswordReset", false);
        initialAdminBootstrap.run(null);

        // Verify admin login STILL returns 200
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty());

        // 5. Verify HOD login still returns 200 and HOD hash is unaffected
        User hodAfter = userRepository.findByEmail("hod.test@knoweb.lk").orElseThrow();
        assertEquals(originalHodHash, hodAfter.getPasswordHash());

        LoginRequest hodReq = new LoginRequest();
        hodReq.setEmail("hod.test@knoweb.lk");
        hodReq.setPassword("Hod1234");
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(hodReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty());
    }

}

