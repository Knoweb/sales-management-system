-- Initial Flyway migration to confirm PostgreSQL setup
-- Business tables will be added in future phases

CREATE TABLE IF NOT EXISTS flyway_init_test (
    id SERIAL PRIMARY KEY,
    initialized_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO flyway_init_test (initialized_at) VALUES (CURRENT_TIMESTAMP);
