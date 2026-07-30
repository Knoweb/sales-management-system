package com.knoweb.salesmanagement.lead.service;

import com.knoweb.salesmanagement.employee.entity.Employee;
import com.knoweb.salesmanagement.employee.repository.EmployeeRepository;
import com.knoweb.salesmanagement.lead.dto.FollowUpDTO;
import com.knoweb.salesmanagement.lead.dto.LeadMapper;
import com.knoweb.salesmanagement.lead.entity.FollowUp;
import com.knoweb.salesmanagement.lead.enums.FollowUpStatus;
import com.knoweb.salesmanagement.lead.repository.FollowUpRepository;
import com.knoweb.salesmanagement.user.entity.User;
import com.knoweb.salesmanagement.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class FollowUpService {

    private final FollowUpRepository followUpRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final LeadMapper leadMapper;

    public FollowUpService(FollowUpRepository followUpRepository,
                           EmployeeRepository employeeRepository,
                           UserRepository userRepository,
                           LeadMapper leadMapper) {
        this.followUpRepository = followUpRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.leadMapper = leadMapper;
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    private Employee getCurrentEmployee() {
        User user = getAuthenticatedUser();
        if (user == null) return null;
        return employeeRepository.findByUserId(user.getId()).orElse(null);
    }

    private boolean hasAuthority(String authority) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals(authority));
    }

    @Transactional(readOnly = true)
    public Page<FollowUpDTO> getFollowUps(String type, Pageable pageable) {
        Specification<FollowUp> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Permission check
            if (!hasAuthority("LEAD_READ_ALL")) {
                Employee emp = getCurrentEmployee();
                if (emp != null) {
                    // Check if lead is assigned to user OR follow up is assigned to user
                    Predicate leadAssigned = cb.equal(root.join("lead").get("assignedTo").get("id"), emp.getId());
                    Predicate followUpAssigned = cb.equal(root.get("assignedTo").get("id"), emp.getId());
                    predicates.add(cb.or(leadAssigned, followUpAssigned));
                } else {
                    predicates.add(cb.equal(root.get("id"), UUID.randomUUID())); // deny
                }
            }

            // 2. Type filtering
            OffsetDateTime now = OffsetDateTime.now();
            if ("overdue".equalsIgnoreCase(type)) {
                predicates.add(cb.notEqual(root.get("status"), FollowUpStatus.COMPLETED));
                predicates.add(cb.lessThan(root.get("followUpDate"), now));
            } else if ("upcoming".equalsIgnoreCase(type)) {
                predicates.add(cb.notEqual(root.get("status"), FollowUpStatus.COMPLETED));
                predicates.add(cb.greaterThanOrEqualTo(root.get("followUpDate"), now));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return followUpRepository.findAll(spec, pageable).map(leadMapper::toFollowUpDto);
    }
}
