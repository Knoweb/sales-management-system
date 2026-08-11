package com.knoweb.salesmanagement.auth.controller;

import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/public/client-verifications")
public class DiagnosticController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DiagnosticController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/diagnostic")
    public ResponseEntity<Map<String, Object>> diagnostic(@RequestParam String email, @RequestParam String rawPassword) {
        Map<String, Object> result = new HashMap<>();
        Optional<User> userOpt = userRepository.findByEmail(email.toLowerCase());
        
        result.put("userFound", userOpt.isPresent());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            result.put("isActive", user.isActive());
            result.put("isLocked", user.isLocked());
            result.put("passwordMatches", passwordEncoder.matches(rawPassword, user.getPasswordHash()));
            result.put("rolesCount", user.getRoles().size());
        }
        
        return ResponseEntity.ok(result);
    }
}
