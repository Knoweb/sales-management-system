package com.knoweb.salesmanagement.skill.service;

import com.knoweb.salesmanagement.common.exception.ResourceNotFoundException;
import com.knoweb.salesmanagement.skill.dto.CreateSkillRequest;
import com.knoweb.salesmanagement.skill.dto.SkillDTO;
import com.knoweb.salesmanagement.skill.dto.UpdateSkillRequest;
import com.knoweb.salesmanagement.skill.entity.Skill;
import com.knoweb.salesmanagement.skill.repository.SkillRepository;
import com.knoweb.salesmanagement.department.service.DepartmentAccessService;
import com.knoweb.salesmanagement.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class SkillService {

    private final SkillRepository skillRepository;
    private final DepartmentAccessService accessService;

    public SkillService(SkillRepository skillRepository, DepartmentAccessService accessService) {
        this.skillRepository = skillRepository;
        this.accessService = accessService;
    }

    public SkillDTO createSkill(CreateSkillRequest request) {
        if (skillRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new IllegalStateException("Skill code already exists: " + request.getCode());
        }
        if (skillRepository.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalStateException("Skill name already exists: " + request.getName());
        }

        Skill skill = new Skill();
        skill.setCode(request.getCode().toUpperCase());
        skill.setName(request.getName());
        skill.setDescription(request.getDescription());
        skill.setActive(true);

        return mapToDTO(skillRepository.save(skill));
    }

    @Transactional(readOnly = true)
    public Page<SkillDTO> searchSkills(String search, Boolean active, Pageable pageable) {
        String safeSearch = search == null ? "" : search;
        return skillRepository.searchSkills(safeSearch, active, pageable)
                .map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public SkillDTO getSkill(UUID id) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found"));
        return mapToDTO(skill);
    }

    public SkillDTO updateSkill(UUID id, UpdateSkillRequest request) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found"));

        Optional<Skill> existing = skillRepository.findByNameIgnoreCase(request.getName());
        if (existing.isPresent() && !existing.get().getId().equals(id)) {
            throw new IllegalStateException("Skill name already exists: " + request.getName());
        }

        skill.setName(request.getName());
        skill.setDescription(request.getDescription());

        return mapToDTO(skillRepository.save(skill));
    }

    public void updateSkillStatus(UUID id) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found"));

        skill.setActive(!skill.isActive());

        skillRepository.save(skill);
    }

    public SkillDTO mapToDTO(Skill skill) {
        SkillDTO dto = new SkillDTO();
        dto.setId(skill.getId());
        dto.setCode(skill.getCode());
        dto.setName(skill.getName());
        dto.setDescription(skill.getDescription());
        dto.setActive(skill.isActive());
        dto.setCreatedAt(skill.getCreatedAt());
        dto.setUpdatedAt(skill.getUpdatedAt());
        return dto;
    }
}
