-- Add Virtual Tour permissions for SALES_OFFICER

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'SALES_OFFICER' AND p.code IN ('VIRTUAL_TOUR_READ', 'VIRTUAL_TOUR_CREATE', 'VIRTUAL_TOUR_UPDATE')
AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
);
