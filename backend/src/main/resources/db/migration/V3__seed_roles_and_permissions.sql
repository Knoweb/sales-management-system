-- Seed Roles
INSERT INTO roles (id, code, name, description, system_role) VALUES 
('eeb3f8a0-2f63-4c91-959c-8f9f8c6b7d2f', 'SYSTEM_ADMIN', 'System Administrator', 'Full system access', true),
('7f76eb1c-6d1f-4b07-9b2f-923f6eb730e2', 'SALES_OFFICER', 'BDP / Sales Officer', 'Sales module access', true),
('d9cb6b5c-4f7f-4b77-8c7c-487bcfd8b13c', 'BDM', 'Business Development Manager', 'Managerial sales access', true),
('64b88d8b-5a1d-4075-8e2b-f73c66f5dfb8', 'TECHNICAL_COORDINATOR', 'Technical Coordinator', 'Technical project setup', true),
('72efaf69-f8c6-43b9-a9a3-5c83f9f9b5cc', 'HOD', 'Head of Department', 'Department management', true),
('f9846067-1121-42e5-b166-5e042b31e3fc', 'ENGINEER', 'Engineer / Employee', 'Standard employee access', true),
('84a7abef-ec11-4f11-9a72-76beaa7fbff8', 'TOP_MANAGEMENT', 'Top Management / General Manager', 'Top-level overview', true)
ON CONFLICT (code) DO NOTHING;

-- Seed Permissions
INSERT INTO permissions (id, code, name, description) VALUES 
('10000000-0000-0000-0000-000000000001', 'AUTH_SELF_READ', 'Read Own Profile', 'Allows user to read their own profile'),
('10000000-0000-0000-0000-000000000002', 'AUTH_PASSWORD_CHANGE', 'Change Own Password', 'Allows user to change their password'),
('10000000-0000-0000-0000-000000000003', 'USER_READ', 'Read Users', 'Allows reading user list and details'),
('10000000-0000-0000-0000-000000000004', 'USER_CREATE', 'Create Users', 'Allows creating new users'),
('10000000-0000-0000-0000-000000000005', 'USER_UPDATE', 'Update Users', 'Allows updating user profiles'),
('10000000-0000-0000-0000-000000000006', 'USER_DISABLE', 'Disable Users', 'Allows activating or disabling users'),
('10000000-0000-0000-0000-000000000007', 'USER_ROLE_ASSIGN', 'Assign Roles', 'Allows assigning roles to users'),
('10000000-0000-0000-0000-000000000008', 'ROLE_READ', 'Read Roles', 'Allows reading the roles list')
ON CONFLICT (code) DO NOTHING;

-- Map permissions to SYSTEM_ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code = 'SYSTEM_ADMIN'
ON CONFLICT DO NOTHING;

-- Map self-service permissions to all roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE p.code IN ('AUTH_SELF_READ', 'AUTH_PASSWORD_CHANGE')
ON CONFLICT DO NOTHING;
