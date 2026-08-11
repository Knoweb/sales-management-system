package com.knoweb.salesmanagement;

import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Optional;

@SpringBootTest
public class FixAdminPasswordTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    public void fixAdminPassword() {
        Optional<User> userOpt = userRepository.findByEmail("admin@knoweb.lk");
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            System.out.println("Updating password for " + user.getEmail());
            user.setPasswordHash(passwordEncoder.encode("Admin1234"));
            userRepository.save(user);
            System.out.println("Password updated successfully.");
        } else {
            System.out.println("User admin@knoweb.lk NOT FOUND");
        }
    }
}
