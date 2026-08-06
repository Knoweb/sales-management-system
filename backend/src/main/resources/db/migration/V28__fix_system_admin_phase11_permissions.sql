-- V28__fix_system_admin_phase11_permissions.sql
-- Assign Phase 11 permissions to SYSTEM_ADMIN since V27 mistakenly used 'SYS_ADMIN'

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'SYSTEM_ADMIN'
  AND p.code IN ('PROJECT_EXECUTION_READ', 'PROJECT_EXECUTION_WRITE', 'PROJECT_EXECUTION_APPROVE')
  AND NOT EXISTS (
      SELECT 1 FROM role_permissions rp
      WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );
