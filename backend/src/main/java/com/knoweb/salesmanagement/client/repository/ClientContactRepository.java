package com.knoweb.salesmanagement.client.repository;

import com.knoweb.salesmanagement.client.entity.ClientContact;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ClientContactRepository extends JpaRepository<ClientContact, UUID> {
    List<ClientContact> findByClientId(UUID clientId);
}
