package com.knoweb.salesmanagement.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.regex.Pattern;

public class DatabaseCreationInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseCreationInitializer.class);
    private static final Pattern DB_NAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_]+$");

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        ConfigurableEnvironment env = applicationContext.getEnvironment();

        boolean isEnabled = env.getProperty("knoweb.database.init.enabled", Boolean.class, true);
        if (!isEnabled) {
            logger.info("DatabaseCreationInitializer is disabled. Skipping database initialization.");
            return;
        }

        String host = env.getProperty("DB_HOST", "localhost");
        String port = env.getProperty("DB_PORT", "5432");
        String dbName = env.getProperty("DB_NAME", "sales_management");
        String username = env.getProperty("DB_USERNAME", "postgres");
        String password = env.getProperty("DB_PASSWORD");
        String adminDb = env.getProperty("DB_ADMIN_DATABASE", "postgres");

        if (password == null || password.trim().isEmpty()) {
            String msg = "DB_PASSWORD is missing. Copy backend/.env.example to backend/.env and configure your local PostgreSQL password.";
            logger.error(msg);
            throw new IllegalStateException(msg);
        }

        validateDatabaseName(dbName);

        String jdbcUrl = String.format("jdbc:postgresql://%s:%s/%s", host, port, adminDb);

        logger.info("Checking PostgreSQL database: {}", dbName);

        try (Connection connection = DriverManager.getConnection(jdbcUrl, username, password)) {
            
            boolean exists = false;
            String checkSql = "SELECT 1 FROM pg_database WHERE datname = ?";
            try (PreparedStatement statement = connection.prepareStatement(checkSql)) {
                statement.setString(1, dbName);
                try (ResultSet resultSet = statement.executeQuery()) {
                    if (resultSet.next()) {
                        exists = true;
                    }
                }
            }

            if (exists) {
                logger.info("Database {} already exists", dbName);
            } else {
                // Ensure proper quoting for the identifier
                String createSql = "CREATE DATABASE \"" + dbName + "\"";
                try (Statement statement = connection.createStatement()) {
                    statement.executeUpdate(createSql);
                    logger.info("Database {} created successfully", dbName);
                }
            }

        } catch (Exception e) {
            if (e.getMessage() != null && e.getMessage().contains("too many clients")) {
                logger.error("Failed to check or create database '{}'. PostgreSQL connection limit reached (too many clients).", dbName);
            } else {
                logger.error("Failed to check or create database '{}'. Ensure the configured user has CREATEDB permissions.", dbName);
            }
            throw new IllegalStateException("Failed to initialize database: " + dbName, e);
        }
    }

    void validateDatabaseName(String dbName) {
        if (dbName == null || dbName.trim().isEmpty()) {
            throw new IllegalArgumentException("Database name cannot be null or empty.");
        }
        if (!DB_NAME_PATTERN.matcher(dbName).matches()) {
            throw new IllegalArgumentException("Invalid database name: '" + dbName + "'. Only letters, numbers, and underscores are allowed.");
        }
    }
}
