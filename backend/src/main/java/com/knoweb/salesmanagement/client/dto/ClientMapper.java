package com.knoweb.salesmanagement.client.dto;

import com.knoweb.salesmanagement.client.entity.Client;
import com.knoweb.salesmanagement.client.entity.ClientContact;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class ClientMapper {

    public ClientDTO toDto(Client client) {
        if (client == null) return null;
        
        ClientDTO dto = new ClientDTO();
        dto.setId(client.getId());
        dto.setName(client.getName());
        dto.setEmail(client.getEmail());
        dto.setPhone(client.getPhone());
        dto.setRegistrationNumber(client.getRegistrationNumber());
        dto.setIndustry(client.getIndustry());
        dto.setAddress(client.getAddress());
        dto.setClientType(client.getClientType());
        dto.setActive(client.isActive());
        dto.setCreatedAt(client.getCreatedAt());
        dto.setUpdatedAt(client.getUpdatedAt());
        
        if (client.getContacts() != null) {
            dto.setContacts(client.getContacts().stream()
                .map(this::toContactDto)
                .collect(Collectors.toList()));
        }
        return dto;
    }

    public ClientContactDTO toContactDto(ClientContact contact) {
        if (contact == null) return null;
        
        ClientContactDTO dto = new ClientContactDTO();
        dto.setId(contact.getId());
        dto.setClientId(contact.getClient().getId());
        dto.setFirstName(contact.getFirstName());
        dto.setLastName(contact.getLastName());
        dto.setEmail(contact.getEmail());
        dto.setPhone(contact.getPhone());
        dto.setJobTitle(contact.getJobTitle());
        dto.setPrimary(contact.isPrimary());
        dto.setActive(contact.isActive());
        return dto;
    }

    public ClientSummaryDTO toSummaryDto(Client client) {
        if (client == null) return null;
        
        ClientSummaryDTO dto = new ClientSummaryDTO();
        dto.setId(client.getId());
        dto.setName(client.getName());
        dto.setEmail(client.getEmail());
        dto.setPhone(client.getPhone());
        dto.setRegistrationNumber(client.getRegistrationNumber());
        dto.setIndustry(client.getIndustry());
        dto.setClientType(client.getClientType());
        dto.setActive(client.isActive());
        dto.setCreatedAt(client.getCreatedAt());
        dto.setUpdatedAt(client.getUpdatedAt());
        
        if (client.getContacts() != null) {
            client.getContacts().stream()
                .filter(ClientContact::isPrimary)
                .findFirst()
                .ifPresent(contact -> {
                    dto.setPrimaryContactName(contact.getFirstName() + " " + contact.getLastName());
                    dto.setPrimaryContactEmail(contact.getEmail());
                    dto.setPrimaryContactPhone(contact.getPhone());
                });
        }
        
        return dto;
    }
}
