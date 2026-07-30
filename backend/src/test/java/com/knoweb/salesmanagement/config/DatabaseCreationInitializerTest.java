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
    void testInitialize_MissingPassword_ThrowsException() {
        org.springframework.context.ConfigurableApplicationContext context = org.mockito.Mockito.mock(org.springframework.context.ConfigurableApplicationContext.class);
        org.springframework.core.env.ConfigurableEnvironment env = org.mockito.Mockito.mock(org.springframework.core.env.ConfigurableEnvironment.class);
        org.mockito.Mockito.when(context.getEnvironment()).thenReturn(env);
        
        org.mockito.Mockito.when(env.getProperty("knoweb.database.init.enabled", Boolean.class, true)).thenReturn(true);
        org.mockito.Mockito.when(env.getProperty("DB_HOST", "localhost")).thenReturn("localhost");
        org.mockito.Mockito.when(env.getProperty("DB_PORT", "5432")).thenReturn("5432");
        org.mockito.Mockito.when(env.getProperty("DB_NAME", "sales_management")).thenReturn("sales_management");
        org.mockito.Mockito.when(env.getProperty("DB_USERNAME", "postgres")).thenReturn("postgres");
        org.mockito.Mockito.when(env.getProperty("DB_PASSWORD")).thenReturn(null);
        org.mockito.Mockito.when(env.getProperty("DB_ADMIN_DATABASE", "postgres")).thenReturn("postgres");

        IllegalStateException exception = assertThrows(
            IllegalStateException.class, 
            () -> initializer.initialize(context)
        );

        assertTrue(exception.getMessage().contains("DB_PASSWORD is missing. Copy backend/.env.example to backend/.env"));
        org.mockito.Mockito.verify(env).getProperty("DB_PASSWORD");
    }

    @Test
    void testInitialize_WithPassword_FailsAtConnection() {
        org.springframework.context.ConfigurableApplicationContext context = org.mockito.Mockito.mock(org.springframework.context.ConfigurableApplicationContext.class);
        org.springframework.core.env.ConfigurableEnvironment env = org.mockito.Mockito.mock(org.springframework.core.env.ConfigurableEnvironment.class);
        org.mockito.Mockito.when(context.getEnvironment()).thenReturn(env);
        
        org.mockito.Mockito.when(env.getProperty("knoweb.database.init.enabled", Boolean.class, true)).thenReturn(true);
        org.mockito.Mockito.when(env.getProperty("DB_HOST", "localhost")).thenReturn("localhost");
        org.mockito.Mockito.when(env.getProperty("DB_PORT", "5432")).thenReturn("12345"); // Invalid port
        org.mockito.Mockito.when(env.getProperty("DB_NAME", "sales_management")).thenReturn("sales_management");
        org.mockito.Mockito.when(env.getProperty("DB_USERNAME", "postgres")).thenReturn("postgres");
        org.mockito.Mockito.when(env.getProperty("DB_PASSWORD")).thenReturn("somepassword");
        org.mockito.Mockito.when(env.getProperty("DB_ADMIN_DATABASE", "postgres")).thenReturn("postgres");

        IllegalStateException exception = assertThrows(
            IllegalStateException.class, 
            () -> initializer.initialize(context)
        );

        assertTrue(exception.getMessage().contains("Failed to initialize database: sales_management"));
        org.mockito.Mockito.verify(env).getProperty("DB_PASSWORD");
    }

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
