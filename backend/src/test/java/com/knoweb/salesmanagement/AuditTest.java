package com.knoweb.salesmanagement;

import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.Commit;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
public class AuditTest {
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    @Transactional
    @Commit
    public void resetAdminPassword() {
        System.out.println("=== RESETTING ADMIN PASSWORD ===");
        userRepository.findAll().forEach(user -> {
            boolean isAdmin = user.getRoles().stream().anyMatch(r -> r.getCode().equals("SYSTEM_ADMIN"));
            if (isAdmin) {
                System.out.println("Found admin: " + user.getEmail());
                user.setPasswordHash(passwordEncoder.encode("password"));
                userRepository.save(user);
                System.out.println("Password reset to 'password' for " + user.getEmail());
            }
        });
        System.out.println("=== DONE ===");
    }
}
