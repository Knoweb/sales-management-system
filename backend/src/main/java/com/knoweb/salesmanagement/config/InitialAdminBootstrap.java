package com.knoweb.salesmanagement.config;

import com.knoweb.salesmanagement.role.entity.Role;
import com.knoweb.salesmanagement.role.repository.RoleRepository;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Component
public class InitialAdminBootstrap implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(InitialAdminBootstrap.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;

    @Value("${INITIAL_ADMIN_EMAIL:#{null}}")
    private String initialAdminEmail;

    @Value("${INITIAL_ADMIN_PASSWORD:#{null}}")
    private String initialAdminPassword;

    @Value("${INITIAL_ADMIN_FIRST_NAME:System}")
    private String initialAdminFirstName;

    @Value("${INITIAL_ADMIN_LAST_NAME:Administrator}")
    private String initialAdminLastName;

    @Value("${ADMIN_RECOVERY_MODE:false}")
    private boolean adminRecoveryMode;

    public InitialAdminBootstrap(UserRepository userRepository, RoleRepository roleRepository, 
                                 PasswordEncoder passwordEncoder, Environment environment) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.environment = environment;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        boolean isProduction = Arrays.stream(environment.getActiveProfiles())
                .anyMatch(p -> "prod".equalsIgnoreCase(p) || "production".equalsIgnoreCase(p));

        if (adminRecoveryMode) {
            if (isProduction) {
                logger.warn("ADMIN_RECOVERY_MODE is ignored in production environment.");
                return;
            }
            if (initialAdminPassword == null || initialAdminPassword.trim().isEmpty()) {
                logger.warn("ADMIN_RECOVERY_MODE enabled but missing INITIAL_ADMIN_PASSWORD. Cannot recover.");
                return;
            }
            
            java.util.List<User> systemAdmins = userRepository.findByRolesCode("SYSTEM_ADMIN");
            if (systemAdmins.isEmpty()) {
                logger.warn("ADMIN_RECOVERY_MODE enabled but no SYSTEM_ADMIN found to recover. Normal bootstrap will proceed if required.");
            } else {
                User adminUser = systemAdmins.get(0);
                adminUser.setPasswordHash(passwordEncoder.encode(initialAdminPassword));
                adminUser.setActive(true);
                adminUser.setLocked(false);
                adminUser.setPasswordChangeRequired(false);

                userRepository.save(adminUser);
                logger.info("System administrator ({}) password successfully recovered via ADMIN_RECOVERY_MODE.", adminUser.getEmail());
                
                disableRecoveryFlagInEnv();
                return;
            }
        }

        long adminCount = userRepository.countActiveSystemAdmins();
        
        if (adminCount > 0) {
            logger.info("System administrator already exists. Skipping bootstrap.");
            return;
        }

        if (initialAdminEmail == null || initialAdminEmail.trim().isEmpty() ||
            initialAdminPassword == null || initialAdminPassword.trim().isEmpty()) {
            logger.warn("No SYSTEM_ADMIN found and missing initial administrator credentials. Please provide INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD.");
            return;
        }

        Optional<User> existingUser = userRepository.findByEmail(initialAdminEmail.toLowerCase());
        if (existingUser.isPresent()) {
            logger.info("User with initial admin email already exists, but is not an active SYSTEM_ADMIN. Skipping bootstrap to prevent overwrite.");
            return;
        }

        Role adminRole = roleRepository.findByCode("SYSTEM_ADMIN")
                .orElseThrow(() -> new IllegalStateException("SYSTEM_ADMIN role not found in database. Ensure Flyway migrations have run."));

        User adminUser = new User();
        adminUser.setEmail(initialAdminEmail.toLowerCase());
        adminUser.setFirstName(initialAdminFirstName);
        adminUser.setLastName(initialAdminLastName);
        adminUser.setPasswordHash(passwordEncoder.encode(initialAdminPassword));
        adminUser.setActive(true);
        adminUser.setLocked(false);
        adminUser.setPasswordChangeRequired(false);

        Set<Role> roles = new HashSet<>();
        roles.add(adminRole);
        adminUser.setRoles(roles);

        userRepository.save(adminUser);
        logger.info("Initial system administrator successfully bootstrapped.");
    }

    private void disableRecoveryFlagInEnv() {
        try {
            java.io.File envFile = new java.io.File(".env");
            if (!envFile.exists()) {
                envFile = new java.io.File("backend/.env");
            }
            
            if (envFile.exists()) {
                java.util.List<String> lines = java.nio.file.Files.readAllLines(envFile.toPath());
                boolean changed = false;
                for (int i = 0; i < lines.size(); i++) {
                    String line = lines.get(i);
                    if (line.trim().startsWith("ADMIN_RECOVERY_MODE=")) {
                        lines.set(i, "ADMIN_RECOVERY_MODE=false");
                        changed = true;
                    }
                }
                if (changed) {
                    java.nio.file.Files.write(envFile.toPath(), lines);
                    logger.info("Disabled ADMIN_RECOVERY_MODE in .env file.");
                }
            }
        } catch (Exception e) {
            logger.error("Failed to disable ADMIN_RECOVERY_MODE in .env file", e);
        }
    }
}

