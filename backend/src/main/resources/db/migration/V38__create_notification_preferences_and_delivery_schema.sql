-- V38__create_notification_preferences_and_delivery_schema.sql

-- 1. Notification Preferences Table
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    event_category VARCHAR(100) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_notification_preferences UNIQUE (user_id, event_category, channel)
);

CREATE INDEX idx_notification_preferences_user ON notification_preferences(user_id);

-- 2. Notification Delivery Attempts Table
CREATE TABLE notification_delivery_attempts (
    id UUID PRIMARY KEY,
    notification_id UUID NOT NULL,
    channel VARCHAR(50) NOT NULL,
    attempt_number INT NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT,
    FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE
);

CREATE INDEX idx_notification_delivery_notification ON notification_delivery_attempts(notification_id);

-- 3. Extend Notifications Table for Delivery Status summary (optional but helpful)
ALTER TABLE notifications ADD COLUMN delivery_status VARCHAR(50) DEFAULT 'PENDING';
