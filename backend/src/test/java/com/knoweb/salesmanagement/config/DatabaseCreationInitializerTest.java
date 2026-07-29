package com.knoweb.salesmanagement.config;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DatabaseCreationInitializerTest {

    private final DatabaseCreationInitializer initializer = new DatabaseCreationInitializer();

    @Test
    void testValidDatabaseNames() {
        assertDoesNotThrow(() -> initializer.validateDatabaseName("sales_management"));
        assertDoesNotThrow(() -> initializer.validateDatabaseName("mydb123"));
        assertDoesNotThrow(() -> initializer.validateDatabaseName("TEST_db"));
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "sales management", // space
        "sales-management", // hyphen
        "sales; DROP TABLE users;", // SQL injection attempt
        "db'", // quote
        "\"db\"", // double quote
        "", // empty
        "   " // only spaces
    })
    void testInvalidDatabaseNames(String invalidDbName) {
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class, 
            () -> initializer.validateDatabaseName(invalidDbName)
        );
        
        if (invalidDbName == null || invalidDbName.trim().isEmpty()) {
            assertTrue(exception.getMessage().contains("cannot be null or empty"));
        } else {
            assertTrue(exception.getMessage().contains("Only letters, numbers, and underscores"));
        }
    }

    @Test
    void testNullDatabaseName() {
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class, 
            () -> initializer.validateDatabaseName(null)
        );
        assertTrue(exception.getMessage().contains("cannot be null or empty"));
    }
}
