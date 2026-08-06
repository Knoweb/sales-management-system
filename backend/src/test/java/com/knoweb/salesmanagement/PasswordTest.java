package com.knoweb.salesmanagement;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class PasswordTest {
    @Test
    public void testPassword() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
        boolean matches = encoder.matches("Admin1234", "$2a$12$Wt0ZEyzHIZR3QFvOWAgiQud0aooUbEaNLbSSnldLxqqlKLzYjHUnu");
        System.out.println("PASSWORD MATCHES: " + matches);
    }
}
