package com.knoweb.salesmanagement.qualification.service;

import com.knoweb.salesmanagement.common.exception.ResourceNotFoundException;
import com.knoweb.salesmanagement.department.service.DepartmentAccessService;
import com.knoweb.salesmanagement.employee.entity.Employee;
import com.knoweb.salesmanagement.employee.repository.EmployeeRepository;
import com.knoweb.salesmanagement.qualification.dto.EmployeeQualificationDTO;
import com.knoweb.salesmanagement.qualification.dto.EmployeeQualificationRequest;
import com.knoweb.salesmanagement.qualification.entity.EmployeeQualification;
import com.knoweb.salesmanagement.qualification.repository.EmployeeQualificationRepository;
import com.knoweb.salesmanagement.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class EmployeeQualificationService {

    private final EmployeeQualificationRepository qualificationRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentAccessService accessService;

    public EmployeeQualificationService(EmployeeQualificationRepository qualificationRepository,
                                        EmployeeRepository employeeRepository,
                                        DepartmentAccessService accessService) {
        this.qualificationRepository = qualificationRepository;
        this.employeeRepository = employeeRepository;
        this.accessService = accessService;
    }

    public EmployeeQualificationDTO addQualification(UUID employeeId, EmployeeQualificationRequest request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        
        accessService.validateEmployeeAccess(employee.getId(), employee.getDepartment().getId());

        EmployeeQualification qualification = new EmployeeQualification();
        qualification.setEmployee(employee);
        qualification.setQualificationName(request.getQualificationName());
        qualification.setInstitution(request.getInstitution());
        qualification.setFieldOfStudy(request.getFieldOfStudy());
        qualification.setQualificationLevel(request.getQualificationLevel());
        qualification.setIssueDate(request.getIssueDate());
        qualification.setExpiryDate(request.getExpiryDate());
        qualification.setCredentialNumber(request.getCredentialNumber());
        qualification.setNotes(request.getNotes());

        if (Boolean.TRUE.equals(request.getVerified()) && (accessService.hasGlobalAccess() || accessService.isDepartmentHeadFor(employee.getDepartment().getId()))) {
            qualification.setVerified(true);
            qualification.setVerifiedAt(OffsetDateTime.now());
        } else {
            qualification.setVerified(false);
        }

        return mapToDTO(qualificationRepository.save(qualification));
    }

    @Transactional(readOnly = true)
    public List<EmployeeQualificationDTO> getEmployeeQualifications(UUID employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        
        accessService.validateEmployeeAccess(employee.getId(), employee.getDepartment().getId());

        return qualificationRepository.findByEmployeeId(employeeId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public EmployeeQualificationDTO updateQualification(UUID employeeId, UUID qualificationId, EmployeeQualificationRequest request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        
        accessService.validateEmployeeAccess(employee.getId(), employee.getDepartment().getId());

        EmployeeQualification qualification = qualificationRepository.findById(qualificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Qualification not found"));

        if (!qualification.getEmployee().getId().equals(employeeId)) {
            throw new IllegalStateException("Qualification does not belong to this employee");
        }

        qualification.setQualificationName(request.getQualificationName());
        qualification.setInstitution(request.getInstitution());
        qualification.setFieldOfStudy(request.getFieldOfStudy());
        qualification.setQualificationLevel(request.getQualificationLevel());
        qualification.setIssueDate(request.getIssueDate());
        qualification.setExpiryDate(request.getExpiryDate());
        qualification.setCredentialNumber(request.getCredentialNumber());
        qualification.setNotes(request.getNotes());

        if (Boolean.TRUE.equals(request.getVerified()) && !qualification.isVerified() && (accessService.hasGlobalAccess() || accessService.isDepartmentHeadFor(employee.getDepartment().getId()))) {
            qualification.setVerified(true);
            qualification.setVerifiedAt(OffsetDateTime.now());
        } else if (Boolean.FALSE.equals(request.getVerified())) {
            qualification.setVerified(false);
            qualification.setVerifiedAt(null);
        }

        return mapToDTO(qualificationRepository.save(qualification));
    }

    public void removeQualification(UUID employeeId, UUID qualificationId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        
        accessService.validateEmployeeAccess(employee.getId(), employee.getDepartment().getId());

        EmployeeQualification qualification = qualificationRepository.findById(qualificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Qualification not found"));

        if (!qualification.getEmployee().getId().equals(employeeId)) {
            throw new IllegalStateException("Qualification does not belong to this employee");
        }

        qualificationRepository.delete(qualification);
    }

    private EmployeeQualificationDTO mapToDTO(EmployeeQualification qualification) {
        EmployeeQualificationDTO dto = new EmployeeQualificationDTO();
        dto.setId(qualification.getId());
        dto.setQualificationName(qualification.getQualificationName());
        dto.setInstitution(qualification.getInstitution());
        dto.setFieldOfStudy(qualification.getFieldOfStudy());
        dto.setQualificationLevel(qualification.getQualificationLevel());
        dto.setIssueDate(qualification.getIssueDate());
        dto.setExpiryDate(qualification.getExpiryDate());
        dto.setCredentialNumber(qualification.getCredentialNumber());
        dto.setNotes(qualification.getNotes());
        dto.setVerified(qualification.isVerified());
        dto.setVerifiedAt(qualification.getVerifiedAt());
        dto.setCreatedAt(qualification.getCreatedAt());
        dto.setUpdatedAt(qualification.getUpdatedAt());
        return dto;
    }
}
