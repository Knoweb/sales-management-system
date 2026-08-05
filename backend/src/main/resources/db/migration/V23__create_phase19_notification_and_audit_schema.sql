-- V23__create_phase19_notification_and_audit_schema.sql

-- 1. Extend Notifications Table
ALTER TABLE notifications RENAME COLUMN notification_type TO event_type;

ALTER TABLE notifications 
    ADD COLUMN context_url VARCHAR(255),
    ADD COLUMN is_read BOOLEAN DEFAULT false NOT NULL,
    ADD COLUMN metadata JSONB;

-- Backfill is_read based on existing read_at
UPDATE notifications SET is_read = true WHERE read_at IS NOT NULL;

-- Indexes and Constraints for Notifications
ALTER TABLE notifications ADD CONSTRAINT uq_notification_deduplication UNIQUE (recipient_user_id, deduplication_key);

CREATE INDEX idx_notifications_recipient_read ON notifications(recipient_user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- 2. Create Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    actor_user_id UUID,
    actor_name_snapshot VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    comments TEXT,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    correlation_id VARCHAR(255),
    request_path VARCHAR(255),
    metadata JSONB
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_occurred_at ON audit_logs(occurred_at);

-- 3. Append-only Protection for audit_logs
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are append-only. UPDATE and DELETE operations are forbidden.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_audit_log_update
BEFORE UPDATE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_log_modification();

CREATE TRIGGER trg_prevent_audit_log_delete
BEFORE DELETE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_log_modification();

-- 4. Seed New Permissions
-- Note: NOTIFICATION_SELF_READ already exists from Phase 5 (V12/V18). 
-- We add NOTIFICATION_MANAGE_PREFERENCES and AUDIT_LOG_READ.

INSERT INTO permissions (id, code, name, description) VALUES 
(gen_random_uuid(), 'NOTIFICATION_MANAGE_PREFERENCES', 'Manage Notification Preferences', 'Allows a user to configure their notification settings'),
(gen_random_uuid(), 'AUDIT_LOG_READ', 'Read Audit Logs', 'Allows a user to view system audit logs');

-- Assign new permissions to SYSTEM_ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p 
WHERE r.code = 'SYSTEM_ADMIN' 
  AND p.code IN ('NOTIFICATION_MANAGE_PREFERENCES', 'AUDIT_LOG_READ');
