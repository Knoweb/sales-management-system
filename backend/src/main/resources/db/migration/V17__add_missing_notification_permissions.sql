-- V17__add_missing_notification_permissions.sql
-- Add missing NOTIFICATION_SELF_READ and NOTIFICATION_SELF_UPDATE permissions to all roles

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code IN ('HEAD_OF_DEPARTMENT', 'TECHNICAL_COORDINATOR', 'HR_MANAGER', 'PROJECT_MANAGER', 'SYSTEM_ADMIN', 'SALES_OFFICER', 'BDM', 'TOP_MANAGEMENT')
  AND p.code IN ('NOTIFICATION_SELF_READ', 'NOTIFICATION_SELF_UPDATE')
ON CONFLICT DO NOTHING;
