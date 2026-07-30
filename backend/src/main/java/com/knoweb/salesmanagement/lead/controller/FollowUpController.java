package com.knoweb.salesmanagement.lead.controller;

import com.knoweb.salesmanagement.lead.dto.FollowUpDTO;
import com.knoweb.salesmanagement.lead.service.FollowUpService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/follow-ups")
public class FollowUpController {

    private final FollowUpService followUpService;

    public FollowUpController(FollowUpService followUpService) {
        this.followUpService = followUpService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('LEAD_READ')")
    public ResponseEntity<Page<FollowUpDTO>> getFollowUps(
            @RequestParam(required = false) String type,
            Pageable pageable) {
        return ResponseEntity.ok(followUpService.getFollowUps(type, pageable));
    }
}
