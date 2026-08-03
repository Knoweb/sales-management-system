package com.knoweb.salesmanagement.config;

import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
public class TempAuditController {
    private final UserRepository userRepository;

    public TempAuditController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/api/v1/temp-audit-users")
    public List<String> getUsers() {
        return userRepository.findAll().stream().map(u -> u.getEmail() + " : " + u.getRoles().stream().map(r -> r.getCode()).collect(Collectors.joining(","))).collect(Collectors.toList());
    }
}
