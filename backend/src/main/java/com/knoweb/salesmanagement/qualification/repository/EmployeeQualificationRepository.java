package com.knoweb.salesmanagement.qualification.repository;

import com.knoweb.salesmanagement.qualification.entity.EmployeeQualification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmployeeQualificationRepository extends JpaRepository<EmployeeQualification, UUID> {
    List<EmployeeQualification> findByEmployeeId(UUID employeeId);
}
