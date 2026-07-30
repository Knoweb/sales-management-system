package com.knoweb.salesmanagement.client.controller;

import com.knoweb.salesmanagement.client.dto.*;
import com.knoweb.salesmanagement.client.service.ClientService;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/clients")
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('CLIENT_READ')")
    public ResponseEntity<Page<ClientSummaryDTO>> searchClients(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            Pageable pageable) {
        Page<ClientSummaryDTO> page = clientService.searchClients(search, active, pageable);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('CLIENT_READ')")
    public ResponseEntity<ClientDTO> getClient(@PathVariable UUID id) {
        return ResponseEntity.ok(clientService.getClientById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CLIENT_CREATE')")
    public ResponseEntity<ClientDTO> createClient(
            @Valid @RequestBody ClientRequest request,
            @RequestParam(defaultValue = "false") boolean ignoreDuplicates) {
        ClientDTO client = clientService.createClient(request, ignoreDuplicates);
        return ResponseEntity.status(HttpStatus.CREATED).body(client);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CLIENT_UPDATE')")
    public ResponseEntity<ClientDTO> updateClient(
            @PathVariable UUID id,
            @Valid @RequestBody ClientRequest request,
            @RequestParam(defaultValue = "false") boolean ignoreDuplicates) {
        return ResponseEntity.ok(clientService.updateClient(id, request, ignoreDuplicates));
    }

    @GetMapping("/{id}/contacts")
    @PreAuthorize("hasAuthority('CLIENT_READ')")
    public ResponseEntity<java.util.List<ClientContactDTO>> getContacts(@PathVariable UUID id) {
        return ResponseEntity.ok(clientService.getContacts(id));
    }

    @GetMapping("/{id}/contacts/{contactId}")
    @PreAuthorize("hasAuthority('CLIENT_READ')")
    public ResponseEntity<ClientContactDTO> getContact(@PathVariable UUID id, @PathVariable UUID contactId) {
        return ResponseEntity.ok(clientService.getContact(id, contactId));
    }

    @PostMapping("/{id}/contacts")
    @PreAuthorize("hasAuthority('CLIENT_UPDATE')")
    public ResponseEntity<ClientContactDTO> addContact(
            @PathVariable UUID id,
            @Valid @RequestBody ClientContactRequest request) {
        ClientContactDTO contact = clientService.addContact(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(contact);
    }

    @PutMapping("/{id}/contacts/{contactId}")
    @PreAuthorize("hasAuthority('CLIENT_UPDATE')")
    public ResponseEntity<ClientContactDTO> updateContact(
            @PathVariable UUID id,
            @PathVariable UUID contactId,
            @Valid @RequestBody ClientContactRequest request) {
        return ResponseEntity.ok(clientService.updateContact(id, contactId, request));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAuthority('CLIENT_UPDATE')")
    public ResponseEntity<Void> activateClient(@PathVariable UUID id) {
        clientService.activateClient(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAuthority('CLIENT_DELETE')")
    public ResponseEntity<Void> deactivateClient(@PathVariable UUID id) {
        clientService.deactivateClient(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/contacts/{contactId}/primary")
    @PreAuthorize("hasAuthority('CLIENT_UPDATE')")
    public ResponseEntity<ClientContactDTO> setPrimaryContact(
            @PathVariable UUID id,
            @PathVariable UUID contactId) {
        return ResponseEntity.ok(clientService.setPrimaryContact(id, contactId));
    }

    @PatchMapping("/{id}/contacts/{contactId}/deactivate")
    @PreAuthorize("hasAuthority('CLIENT_UPDATE')")
    public ResponseEntity<Void> deactivateContact(
            @PathVariable UUID id,
            @PathVariable UUID contactId) {
        clientService.deactivateContact(id, contactId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/contacts/{contactId}/activate")
    @PreAuthorize("hasAuthority('CLIENT_UPDATE')")
    public ResponseEntity<Void> activateContact(
            @PathVariable UUID id,
            @PathVariable UUID contactId) {
        clientService.activateContact(id, contactId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/duplicate-check")
    @PreAuthorize("hasAuthority('CLIENT_READ') or hasAuthority('CLIENT_CREATE')")
    public ResponseEntity<DuplicateClientCheckResponse> checkDuplicates(
            @Valid @RequestBody ClientRequest request,
            @RequestParam(required = false) UUID excludeClientId) {
        return ResponseEntity.ok(clientService.checkDuplicates(request, excludeClientId));
    }
}
