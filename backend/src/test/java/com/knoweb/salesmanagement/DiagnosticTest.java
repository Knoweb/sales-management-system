package com.knoweb.salesmanagement;

import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Optional;

@SpringBootTest
public class DiagnosticTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    public void runDiagnostic() {
        System.out.println("====== DIAGNOSTIC START ======");
        Optional<User> userOpt = userRepository.findByEmail("admin@knoweb.lk");
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            System.out.println("User found: " + user.getEmail());
            System.out.println("Active: " + user.isActive());
            System.out.println("Locked: " + user.isLocked());
            System.out.println("Password Hash: " + user.getPasswordHash());
            boolean match = passwordEncoder.matches("Admin1234", user.getPasswordHash());
            System.out.println("Password Match for Admin1234: " + match);
            System.out.println("Roles: " + user.getRoles().size());
            user.getRoles().forEach(r -> System.out.println("Role: " + r.getCode()));
        } else {
            System.out.println("User admin@knoweb.lk NOT FOUND");
            
            System.out.println("Total SYSTEM_ADMINs: " + userRepository.countActiveSystemAdmins());
            userRepository.findAll().forEach(u -> {
                System.out.println("Found user in DB: " + u.getEmail() + " Hash: " + u.getPasswordHash());
            });
        }
        System.out.println("====== DIAGNOSTIC END ======");
    }
}
