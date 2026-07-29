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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Component
public class InitialAdminBootstrap implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(InitialAdminBootstrap.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${INITIAL_ADMIN_EMAIL:#{null}}")
    private String initialAdminEmail;

    @Value("${INITIAL_ADMIN_PASSWORD:#{null}}")
    private String initialAdminPassword;

    @Value("${INITIAL_ADMIN_FIRST_NAME:System}")
    private String initialAdminFirstName;

    @Value("${INITIAL_ADMIN_LAST_NAME:Administrator}")
    private String initialAdminLastName;

    public InitialAdminBootstrap(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
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
}
