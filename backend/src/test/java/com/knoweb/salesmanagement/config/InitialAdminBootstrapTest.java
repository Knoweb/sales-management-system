package com.knoweb.salesmanagement.config;

import com.knoweb.salesmanagement.role.entity.Role;
import com.knoweb.salesmanagement.role.repository.RoleRepository;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.ApplicationArguments;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InitialAdminBootstrapTest {

    @Mock
    private UserRepository userRepository;
    
    @Mock
    private RoleRepository roleRepository;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @Mock
    private Environment environment;
    
    @Mock
    private ApplicationArguments applicationArguments;

    private InitialAdminBootstrap bootstrap;

    @BeforeEach
    void setUp() {
        bootstrap = new InitialAdminBootstrap(userRepository, roleRepository, passwordEncoder, environment);
        ReflectionTestUtils.setField(bootstrap, "initialAdminEmail", "admin@test.com");
        ReflectionTestUtils.setField(bootstrap, "initialAdminPassword", "NewAdmin123");
        ReflectionTestUtils.setField(bootstrap, "initialAdminFirstName", "Admin");
        ReflectionTestUtils.setField(bootstrap, "initialAdminLastName", "System");
        ReflectionTestUtils.setField(bootstrap, "adminRecoveryMode", false);
        
        lenient().when(environment.getActiveProfiles()).thenReturn(new String[]{"dev"});
    }

    @Test
    void shouldSkipBootstrapIfAdminExistsNormally() {
        when(userRepository.countActiveSystemAdmins()).thenReturn(1L);

        bootstrap.run(applicationArguments);

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void explicitRecoveryResetsOnlyAdmin() {
        ReflectionTestUtils.setField(bootstrap, "adminRecoveryMode", true);
        
        User admin = new User();
        admin.setEmail("admin@knoweb.lk");
        admin.setPasswordHash("old_hash");
        admin.setLocked(true);
        
        when(userRepository.findByRolesCode("SYSTEM_ADMIN")).thenReturn(List.of(admin));
        when(passwordEncoder.encode("NewAdmin123")).thenReturn("new_hash");

        bootstrap.run(applicationArguments);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        
        User savedUser = userCaptor.getValue();
        assertEquals("admin@knoweb.lk", savedUser.getEmail());
        assertEquals("new_hash", savedUser.getPasswordHash());
        assertTrue(savedUser.isActive());
        assertFalse(savedUser.isLocked());
        assertFalse(savedUser.isPasswordChangeRequired());
        
        // Ensure other users are not queried or changed via findByEmail
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    void recoveryDisabledByDefault() {
        ReflectionTestUtils.setField(bootstrap, "adminRecoveryMode", false);
        when(userRepository.countActiveSystemAdmins()).thenReturn(1L);
        
        bootstrap.run(applicationArguments);

        verify(userRepository, never()).findByRolesCode(anyString());
        verify(userRepository, never()).save(any(User.class));
    }
}
