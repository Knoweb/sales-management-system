package com.knoweb.salesmanagement.client.repository;

import com.knoweb.salesmanagement.client.entity.Client;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ClientRepository extends JpaRepository<Client, UUID> {
    
    @Query("SELECT c FROM Client c WHERE " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(c.registrationNumber) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:active IS NULL OR c.active = :active)")
    Page<Client> searchClients(@Param("search") String search, @Param("active") Boolean active, Pageable pageable);
    
    Optional<Client> findFirstByEmailIgnoreCase(String email);
    Optional<Client> findFirstByEmailIgnoreCaseAndIdNot(String email, UUID id);
    
    Optional<Client> findFirstByRegistrationNumberIgnoreCase(String registrationNumber);
    Optional<Client> findFirstByRegistrationNumberIgnoreCaseAndIdNot(String registrationNumber, UUID id);
    
    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, UUID id);
    
    Optional<Client> findFirstByPhone(String phone);
    Optional<Client> findFirstByPhoneAndIdNot(String phone, UUID id);
}
