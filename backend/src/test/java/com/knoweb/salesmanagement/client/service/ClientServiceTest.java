package com.knoweb.salesmanagement.client.service;

import com.knoweb.salesmanagement.client.dto.ClientRequest;
import com.knoweb.salesmanagement.client.dto.DuplicateClientCheckResponse;
import com.knoweb.salesmanagement.client.dto.ClientMapper;
import com.knoweb.salesmanagement.client.entity.Client;
import com.knoweb.salesmanagement.client.repository.ClientContactRepository;
import com.knoweb.salesmanagement.client.repository.ClientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClientServiceTest {

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private ClientContactRepository clientContactRepository;

    @Mock
    private ClientMapper clientMapper;

    @InjectMocks
    private ClientService clientService;

    private ClientRequest request;
    private Client activeClient;
    private Client inactiveClient;

    @BeforeEach
    void setUp() {
        request = new ClientRequest();
        
        activeClient = new Client();
        activeClient.setId(UUID.randomUUID());
        activeClient.setActive(true);
        
        inactiveClient = new Client();
        inactiveClient.setId(UUID.randomUUID());
        inactiveClient.setActive(false);
    }

    @Test
    void checkDuplicates_RegistrationNumberExistsActive_ReturnsConflict() {
        request.setRegistrationNumber("REG123");
        when(clientRepository.findFirstByRegistrationNumberIgnoreCase("REG123")).thenReturn(Optional.of(activeClient));
        
        DuplicateClientCheckResponse response = clientService.checkDuplicates(request, null);
        
        assertTrue(response.isHasConflict());
        assertEquals("A client with this registration number already exists.", response.getMessage());
        assertEquals("REG123", request.getRegistrationNumber());
    }

    @Test
    void checkDuplicates_RegistrationNumberExistsInactive_ReturnsSpecialConflict() {
        request.setRegistrationNumber("REG123");
        when(clientRepository.findFirstByRegistrationNumberIgnoreCase("REG123")).thenReturn(Optional.of(inactiveClient));
        
        DuplicateClientCheckResponse response = clientService.checkDuplicates(request, null);
        
        assertTrue(response.isHasConflict());
        assertEquals("A matching client already exists but is inactive and should be reactivated instead of creating a duplicate record.", response.getMessage());
    }

    @Test
    void checkDuplicates_EmailExistsInactive_ReturnsSpecialConflict() {
        request.setEmail("test@example.com");
        when(clientRepository.findFirstByEmailIgnoreCase("test@example.com")).thenReturn(Optional.of(inactiveClient));
        
        DuplicateClientCheckResponse response = clientService.checkDuplicates(request, null);
        
        assertTrue(response.isHasConflict());
        assertEquals("A matching client already exists but is inactive and should be reactivated instead of creating a duplicate record.", response.getMessage());
    }

    @Test
    void checkDuplicates_PhoneExistsInactive_ReturnsSpecialConflict() {
        request.setPhone("1234567890");
        when(clientRepository.findFirstByPhone("1234567890")).thenReturn(Optional.of(inactiveClient));
        
        DuplicateClientCheckResponse response = clientService.checkDuplicates(request, null);
        
        assertTrue(response.isHasConflict());
        assertEquals("A matching client already exists but is inactive and should be reactivated instead of creating a duplicate record.", response.getMessage());
    }

    @Test
    void checkDuplicates_NameExists_ReturnsWarning() {
        request.setName("Test Company");
        when(clientRepository.existsByNameIgnoreCase("Test Company")).thenReturn(true);
        
        DuplicateClientCheckResponse response = clientService.checkDuplicates(request, null);
        
        assertFalse(response.isHasConflict());
        assertTrue(response.isHasWarning());
        assertEquals("A client with this name might already exist.", response.getMessage());
    }
}
