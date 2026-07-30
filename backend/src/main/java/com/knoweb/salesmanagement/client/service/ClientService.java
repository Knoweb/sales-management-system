package com.knoweb.salesmanagement.client.service;

import com.knoweb.salesmanagement.client.dto.*;
import com.knoweb.salesmanagement.client.entity.Client;
import com.knoweb.salesmanagement.client.entity.ClientContact;
import com.knoweb.salesmanagement.client.repository.ClientContactRepository;
import com.knoweb.salesmanagement.client.repository.ClientRepository;
import com.knoweb.salesmanagement.common.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Service
public class ClientService {

    private final ClientRepository clientRepository;
    private final ClientContactRepository clientContactRepository;
    private final ClientMapper clientMapper;

    public ClientService(ClientRepository clientRepository, ClientContactRepository clientContactRepository, ClientMapper clientMapper) {
        this.clientRepository = clientRepository;
        this.clientContactRepository = clientContactRepository;
        this.clientMapper = clientMapper;
    }

    @PreAuthorize("hasAuthority('CLIENT_READ')")
    @Transactional(readOnly = true)
    public Page<ClientSummaryDTO> searchClients(String search, Boolean active, Pageable pageable) {
        String safeSearch = search != null ? search : "";
        return clientRepository.searchClients(safeSearch, active, pageable).map(clientMapper::toSummaryDto);
    }

    @PreAuthorize("hasAuthority('CLIENT_READ')")
    @Transactional(readOnly = true)
    public ClientDTO getClientById(UUID id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));
        return clientMapper.toDto(client);
    }

    @PreAuthorize("hasAuthority('CLIENT_CREATE')")
    @Transactional
    public ClientDTO createClient(ClientRequest request, boolean ignoreDuplicates) {
        DuplicateClientCheckResponse duplicateCheck = checkDuplicates(request, null);
        
        if (duplicateCheck.isHasConflict()) {
            throw new DuplicateClientException(duplicateCheck.getMessage());
        }
        
        if (duplicateCheck.isHasWarning() && !ignoreDuplicates) {
            throw new DuplicateClientException(duplicateCheck.getMessage());
        }

        Client client = new Client();
        client.setName(request.getName());
        client.setEmail(request.getEmail());
        client.setPhone(request.getPhone());
        client.setRegistrationNumber(request.getRegistrationNumber());
        client.setIndustry(request.getIndustry());
        client.setAddress(request.getAddress());
        client.setClientType(request.getClientType());
        
        client = clientRepository.save(client);
        return clientMapper.toDto(client);
    }

    @PreAuthorize("hasAuthority('CLIENT_UPDATE')")
    @Transactional
    public ClientDTO updateClient(UUID id, ClientRequest request, boolean ignoreDuplicates) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));

        DuplicateClientCheckResponse duplicateCheck = checkDuplicates(request, id);
        
        if (duplicateCheck.isHasConflict()) {
            throw new DuplicateClientException(duplicateCheck.getMessage());
        }
        
        if (duplicateCheck.isHasWarning() && !ignoreDuplicates) {
            throw new DuplicateClientException(duplicateCheck.getMessage());
        }

        client.setName(request.getName());
        client.setEmail(request.getEmail());
        client.setPhone(request.getPhone());
        client.setRegistrationNumber(request.getRegistrationNumber());
        client.setIndustry(request.getIndustry());
        client.setAddress(request.getAddress());
        client.setClientType(request.getClientType());

        client = clientRepository.save(client);
        return clientMapper.toDto(client);
    }

    @PreAuthorize("hasAuthority('CLIENT_DELETE')")
    @Transactional
    public void deactivateClient(UUID id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));
        client.setActive(false);
        clientRepository.save(client);
    }

    @PreAuthorize("hasAuthority('CLIENT_UPDATE')")
    @Transactional
    public void activateClient(UUID id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));
        client.setActive(true);
        clientRepository.save(client);
    }

    @PreAuthorize("hasAuthority('CLIENT_UPDATE')")
    @Transactional
    public ClientContactDTO addContact(UUID clientId, ClientContactRequest request) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));

        ClientContact contact = new ClientContact();
        contact.setClient(client);
        contact.setFirstName(request.getFirstName());
        contact.setLastName(request.getLastName());
        contact.setEmail(request.getEmail());
        contact.setPhone(request.getPhone());
        contact.setJobTitle(request.getJobTitle());
        contact.setPrimary(request.isPrimary());

        if (request.isPrimary()) {
            resetOtherPrimaryContacts(clientId);
        }

        contact = clientContactRepository.save(contact);
        return clientMapper.toContactDto(contact);
    }

    @PreAuthorize("hasAuthority('CLIENT_UPDATE')")
    @Transactional
    public ClientContactDTO updateContact(UUID clientId, UUID contactId, ClientContactRequest request) {
        ClientContact contact = clientContactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));

        if (!contact.getClient().getId().equals(clientId)) {
            throw new IllegalArgumentException("Contact does not belong to this client");
        }

        contact.setFirstName(request.getFirstName());
        contact.setLastName(request.getLastName());
        contact.setEmail(request.getEmail());
        contact.setPhone(request.getPhone());
        contact.setJobTitle(request.getJobTitle());
        
        if (request.isPrimary() && !contact.isPrimary()) {
            resetOtherPrimaryContacts(clientId);
        }
        contact.setPrimary(request.isPrimary());

        contact = clientContactRepository.save(contact);
        return clientMapper.toContactDto(contact);
    }

    @PreAuthorize("hasAuthority('CLIENT_READ')")
    @Transactional(readOnly = true)
    public java.util.List<ClientContactDTO> getContacts(UUID clientId) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));
        return clientContactRepository.findByClientId(clientId).stream()
                .map(clientMapper::toContactDto)
                .collect(java.util.stream.Collectors.toList());
    }

    @PreAuthorize("hasAuthority('CLIENT_READ')")
    @Transactional(readOnly = true)
    public ClientContactDTO getContact(UUID clientId, UUID contactId) {
        ClientContact contact = clientContactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));
        if (!contact.getClient().getId().equals(clientId)) {
            throw new IllegalArgumentException("Contact does not belong to this client");
        }
        return clientMapper.toContactDto(contact);
    }

    @PreAuthorize("hasAuthority('CLIENT_UPDATE')")
    @Transactional
    public ClientContactDTO setPrimaryContact(UUID clientId, UUID contactId) {
        ClientContact contact = clientContactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));

        if (!contact.getClient().getId().equals(clientId)) {
            throw new IllegalArgumentException("Contact does not belong to this client");
        }
        
        if (!contact.isActive()) {
            throw new IllegalStateException("Cannot set a deactivated contact as primary");
        }

        resetOtherPrimaryContacts(clientId);
        contact.setPrimary(true);

        contact = clientContactRepository.save(contact);
        return clientMapper.toContactDto(contact);
    }

    @PreAuthorize("hasAuthority('CLIENT_UPDATE')")
    @Transactional
    public void deactivateContact(UUID clientId, UUID contactId) {
        ClientContact contact = clientContactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));

        if (!contact.getClient().getId().equals(clientId)) {
            throw new IllegalArgumentException("Contact does not belong to this client");
        }

        contact.setActive(false);
        if (contact.isPrimary()) {
            contact.setPrimary(false);
        }
        clientContactRepository.save(contact);
    }

    @PreAuthorize("hasAuthority('CLIENT_UPDATE')")
    @Transactional
    public void activateContact(UUID clientId, UUID contactId) {
        ClientContact contact = clientContactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));

        if (!contact.getClient().getId().equals(clientId)) {
            throw new IllegalArgumentException("Contact does not belong to this client");
        }

        contact.setActive(true);
        clientContactRepository.save(contact);
    }

    private void resetOtherPrimaryContacts(UUID clientId) {
        clientContactRepository.findByClientId(clientId).forEach(c -> {
            if (c.isPrimary()) {
                c.setPrimary(false);
                clientContactRepository.save(c);
            }
        });
    }

    @PreAuthorize("hasAuthority('CLIENT_READ') or hasAuthority('CLIENT_CREATE')")
    @Transactional(readOnly = true)
    public DuplicateClientCheckResponse checkDuplicates(ClientRequest request, UUID excludeClientId) {
        String inactiveMessage = "A matching client already exists but is inactive and should be reactivated instead of creating a duplicate record.";

        if (StringUtils.hasText(request.getRegistrationNumber())) {
            java.util.Optional<Client> existing = excludeClientId != null 
                ? clientRepository.findFirstByRegistrationNumberIgnoreCaseAndIdNot(request.getRegistrationNumber(), excludeClientId)
                : clientRepository.findFirstByRegistrationNumberIgnoreCase(request.getRegistrationNumber());
            if (existing.isPresent()) {
                if (!existing.get().isActive()) {
                    return new DuplicateClientCheckResponse(true, false, inactiveMessage, "REGISTRATION_NUMBER");
                }
                return new DuplicateClientCheckResponse(true, false, "A client with this registration number already exists.", "REGISTRATION_NUMBER");
            }
        }
        
        if (StringUtils.hasText(request.getEmail())) {
            java.util.Optional<Client> existing = excludeClientId != null
                ? clientRepository.findFirstByEmailIgnoreCaseAndIdNot(request.getEmail(), excludeClientId)
                : clientRepository.findFirstByEmailIgnoreCase(request.getEmail());
            if (existing.isPresent()) {
                if (!existing.get().isActive()) {
                    return new DuplicateClientCheckResponse(true, false, inactiveMessage, "EMAIL");
                }
                return new DuplicateClientCheckResponse(true, false, "A client with this email already exists.", "EMAIL");
            }
        }
        
        if (StringUtils.hasText(request.getPhone())) {
            java.util.Optional<Client> existing = excludeClientId != null
                ? clientRepository.findFirstByPhoneAndIdNot(request.getPhone(), excludeClientId)
                : clientRepository.findFirstByPhone(request.getPhone());
            if (existing.isPresent()) {
                if (!existing.get().isActive()) {
                    return new DuplicateClientCheckResponse(true, false, inactiveMessage, "PHONE");
                }
                return new DuplicateClientCheckResponse(true, false, "A client with this phone number already exists.", "PHONE");
            }
        }
        
        if (StringUtils.hasText(request.getName())) {
            boolean exists = excludeClientId != null
                ? clientRepository.existsByNameIgnoreCaseAndIdNot(request.getName(), excludeClientId)
                : clientRepository.existsByNameIgnoreCase(request.getName());
            if (exists) {
                return new DuplicateClientCheckResponse(false, true, "A client with this name might already exist.", "NAME");
            }
        }
        
        return new DuplicateClientCheckResponse(false, false, "No duplicates found.", null);
    }
}
