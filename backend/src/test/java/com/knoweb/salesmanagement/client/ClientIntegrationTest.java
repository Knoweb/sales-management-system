package com.knoweb.salesmanagement.client;

import com.knoweb.salesmanagement.client.dto.ClientSummaryDTO;
import com.knoweb.salesmanagement.client.repository.ClientRepository;
import com.knoweb.salesmanagement.client.service.ClientService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.test.context.support.WithMockUser;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
public class ClientIntegrationTest {

    @Autowired
    private ClientService clientService;

    @Autowired
    private ClientRepository clientRepository;

    @Test
    @WithMockUser(authorities = "CLIENT_READ")
    void testSearchClientsWithNullSearch_ShouldNotThrowByteaException() {
        // This test reproduces the exact root cause by passing null to the search parameter.
        // If the Postgres bytea inference error occurs, this will throw an exception.
        Page<ClientSummaryDTO> result = clientService.searchClients(null, null, PageRequest.of(0, 10));
        assertNotNull(result);
    }
    
    @Test
    @WithMockUser(authorities = "CLIENT_READ")
    void testSearchClientsWithBlankSearch_ShouldNotFail() {
        Page<ClientSummaryDTO> result = clientService.searchClients("   ", null, PageRequest.of(0, 10));
        assertNotNull(result);
    }
}
