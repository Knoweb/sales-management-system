-- Fix permissions for System Admin because the role code is SYSTEM_ADMIN, not SYS_ADMIN

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'SYSTEM_ADMIN' AND p.code IN ('VIRTUAL_TOUR_READ', 'VIRTUAL_TOUR_CREATE', 'VIRTUAL_TOUR_UPDATE', 'VIRTUAL_TOUR_DELETE')
AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
);
