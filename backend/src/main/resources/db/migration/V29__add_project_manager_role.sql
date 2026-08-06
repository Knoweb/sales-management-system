-- Add execution_notes to project_execution_workspaces
ALTER TABLE project_execution_workspaces
ADD COLUMN execution_notes TEXT;

-- Insert the PROJECT_MANAGER role
INSERT INTO roles (id, code, name, description)
VALUES (
    gen_random_uuid(),
    'PROJECT_MANAGER',
    'Project Manager',
    'Project Manager for execution workspaces'
);

-- Grant Phase 11 permissions to the new PROJECT_MANAGER role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'PROJECT_MANAGER'
  AND p.code IN (
      'PROJECT_EXECUTION_READ',
      'PROJECT_EXECUTION_WRITE',
      'PROJECT_EXECUTION_APPROVE'
  );
