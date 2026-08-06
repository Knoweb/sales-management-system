-- Grant PROJECT_EXECUTION_READ to TOP_MANAGEMENT
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'TOP_MANAGEMENT'
  AND p.code = 'PROJECT_EXECUTION_READ';
