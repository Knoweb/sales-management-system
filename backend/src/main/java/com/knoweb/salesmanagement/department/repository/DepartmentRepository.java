package com.knoweb.salesmanagement.department.repository;

import com.knoweb.salesmanagement.department.entity.Department;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, UUID> {
    Optional<Department> findByCodeIgnoreCase(String code);
    Optional<Department> findByNameIgnoreCase(String name);
    boolean existsByCodeIgnoreCase(String code);
    boolean existsByNameIgnoreCase(String name);

    @Query("SELECT d FROM Department d WHERE " +
           "(:active IS NULL OR d.active = :active) AND " +
           "(LOWER(d.code) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Department> searchDepartments(@Param("search") String search, @Param("active") Boolean active, Pageable pageable);
}
