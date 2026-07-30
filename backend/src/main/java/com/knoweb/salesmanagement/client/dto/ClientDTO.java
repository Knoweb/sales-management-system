package com.knoweb.salesmanagement.client.dto;

import com.knoweb.salesmanagement.client.enums.ClientType;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class ClientDTO {
    private UUID id;
    private String name;
    private String email;
    private String phone;
    private String registrationNumber;
    private String industry;
    private String address;
    private ClientType clientType;
    private boolean active;
    private List<ClientContactDTO> contacts;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    
    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }
    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public ClientType getClientType() { return clientType; }
    public void setClientType(ClientType clientType) { this.clientType = clientType; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public List<ClientContactDTO> getContacts() { return contacts; }
    public void setContacts(List<ClientContactDTO> contacts) { this.contacts = contacts; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
