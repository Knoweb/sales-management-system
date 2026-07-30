package com.knoweb.salesmanagement.skill.controller;

import com.knoweb.salesmanagement.skill.dto.CreateSkillRequest;
import com.knoweb.salesmanagement.skill.dto.SkillDTO;
import com.knoweb.salesmanagement.skill.dto.UpdateSkillRequest;
import com.knoweb.salesmanagement.skill.service.SkillService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/skills")
public class SkillController {

    private final SkillService skillService;

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public SkillDTO createSkill(@Valid @RequestBody CreateSkillRequest request) {
        return skillService.createSkill(request);
    }

    @GetMapping
    public Page<SkillDTO> searchSkills(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            Pageable pageable) {
        return skillService.searchSkills(search, active, pageable);
    }

    @GetMapping("/{id}")
    public SkillDTO getSkill(@PathVariable UUID id) {
        return skillService.getSkill(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public SkillDTO updateSkill(@PathVariable UUID id, @Valid @RequestBody UpdateSkillRequest request) {
        return skillService.updateSkill(id, request);
    }

    @PatchMapping("/{id}/status")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public void updateSkillStatus(@PathVariable UUID id) {
        skillService.updateSkillStatus(id);
    }
}
