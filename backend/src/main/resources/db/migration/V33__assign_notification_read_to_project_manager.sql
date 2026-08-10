-- V33__assign_notification_read_to_project_manager.sql

-- Assign NOTIFICATION_READ to PROJECT_MANAGER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'PROJECT_MANAGER'
  AND p.code = 'NOTIFICATION_READ'
ON CONFLICT DO NOTHING;
