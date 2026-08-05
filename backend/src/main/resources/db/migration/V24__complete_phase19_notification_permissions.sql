-- V24__complete_phase19_notification_permissions.sql

-- 1. Seed Permissions
INSERT INTO permissions (id, code, name, description, created_at)
VALUES 
    (gen_random_uuid(), 'NOTIFICATION_READ', 'Notification Read', 'Read all notifications system-wide', NOW()),
    (gen_random_uuid(), 'NOTIFICATION_MANAGE_PREFERENCES', 'Notification Manage Preferences', 'Manage notification preferences system-wide', NOW()),
    (gen_random_uuid(), 'AUDIT_LOG_READ', 'Audit Log Read', 'Read system audit logs', NOW())
ON CONFLICT (code) DO NOTHING;

-- 2. Assign to SYSTEM_ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code = 'SYSTEM_ADMIN' 
  AND p.code IN ('NOTIFICATION_READ', 'NOTIFICATION_MANAGE_PREFERENCES', 'AUDIT_LOG_READ')
ON CONFLICT DO NOTHING;
