package com.knoweb.salesmanagement.projectbrief.dto;

import tools.jackson.databind.json.JsonMapper;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class ProjectBriefDTOSerializationTest {

    @Test
    void testProjectBriefDTOSerialization() throws Exception {
        JsonMapper jsonMapper = JsonMapper.builder()
                .findAndAddModules()
                .build();

        ProjectBriefDTO dto = new ProjectBriefDTO();
        dto.setId(UUID.randomUUID());
        dto.setOpportunityId(UUID.randomUUID());
        dto.setProjectTitle("Test Serialization");
        dto.setExpectedDeadline(LocalDate.of(2026, 12, 31));
        dto.setCreatedAt(OffsetDateTime.now());
        dto.setUpdatedAt(OffsetDateTime.now());
        dto.setExpectedBudget(new BigDecimal("10000"));
        dto.setCurrency("USD");


        String json = jsonMapper.writeValueAsString(dto);

        assertNotNull(json, "Snapshot is not null");
        assertTrue(json.contains("\"expectedDeadline\":[2026,12,31]") || json.contains("\"expectedDeadline\":\"2026-12-31\""), "expectedDeadline serializes successfully");
        assertTrue(json.contains("createdAt"), "Java time values appear in the snapshot");
    }
}
