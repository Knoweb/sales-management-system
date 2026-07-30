package com.knoweb.salesmanagement.skill.repository;

import com.knoweb.salesmanagement.skill.entity.EmployeeSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmployeeSkillRepository extends JpaRepository<EmployeeSkill, UUID> {
    List<EmployeeSkill> findByEmployeeId(UUID employeeId);
    boolean existsByEmployeeIdAndSkillId(UUID employeeId, UUID skillId);
    java.util.Optional<EmployeeSkill> findByEmployeeIdAndSkillId(UUID employeeId, UUID skillId);
}
