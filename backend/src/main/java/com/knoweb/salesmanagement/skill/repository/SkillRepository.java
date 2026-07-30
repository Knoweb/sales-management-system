package com.knoweb.salesmanagement.skill.repository;

import com.knoweb.salesmanagement.skill.entity.Skill;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SkillRepository extends JpaRepository<Skill, UUID> {
    Optional<Skill> findByCodeIgnoreCase(String code);
    Optional<Skill> findByNameIgnoreCase(String name);
    boolean existsByCodeIgnoreCase(String code);
    boolean existsByNameIgnoreCase(String name);

    @Query("SELECT s FROM Skill s WHERE " +
           "(:active IS NULL OR s.active = :active) AND " +
           "(LOWER(s.code) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Skill> searchSkills(@Param("search") String search, @Param("active") Boolean active, Pageable pageable);
}
