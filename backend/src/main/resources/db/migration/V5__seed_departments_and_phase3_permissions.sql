-- V5__seed_departments_and_phase3_permissions.sql

-- Seed initial departments
INSERT INTO departments (id, code, name, description, active, system_seeded, created_at, updated_at) VALUES 
('10000000-0000-0000-0001-000000000001', 'MECHANICAL', 'Mechanical Department', 'Mechanical Engineering', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('10000000-0000-0000-0001-000000000002', 'ELECTRICAL', 'Electrical Department', 'Electrical Engineering', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('10000000-0000-0000-0001-000000000003', 'ELECTRONIC', 'Electronic Department', 'Electronic Engineering', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('10000000-0000-0000-0001-000000000004', 'SOFTWARE', 'Software Department', 'Software Engineering', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('10000000-0000-0000-0001-000000000005', 'FABRICATION', 'Fabrication Department', 'Manufacturing and Fabrication', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('10000000-0000-0000-0001-000000000006', 'INSTALLATION', 'Installation Department', 'Site Installation', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;

-- Insert new Phase 3 permissions
INSERT INTO permissions (id, code, name, description) VALUES 
('20000000-0000-0000-0000-000000000001', 'DEPARTMENT_READ', 'Read Departments', 'Allows reading department details'),
('20000000-0000-0000-0000-000000000002', 'DEPARTMENT_CREATE', 'Create Departments', 'Allows creating new departments'),
('20000000-0000-0000-0000-000000000003', 'DEPARTMENT_UPDATE', 'Update Departments', 'Allows updating existing departments'),
('20000000-0000-0000-0000-000000000004', 'DEPARTMENT_DISABLE', 'Disable Departments', 'Allows enabling/disabling departments'),
('20000000-0000-0000-0000-000000000005', 'DEPARTMENT_HEAD_ASSIGN', 'Assign Department Head', 'Allows assigning an employee as HOD'),

('20000000-0000-0000-0000-000000000011', 'EMPLOYEE_SELF_READ', 'Read Own Profile', 'Allows user to read their own linked employee profile'),
('20000000-0000-0000-0000-000000000012', 'EMPLOYEE_READ', 'Read Employees', 'Allows reading employee details'),
('20000000-0000-0000-0000-000000000013', 'EMPLOYEE_CREATE', 'Create Employees', 'Allows creating new employees'),
('20000000-0000-0000-0000-000000000014', 'EMPLOYEE_UPDATE', 'Update Employees', 'Allows updating employee details'),
('20000000-0000-0000-0000-000000000015', 'EMPLOYEE_DISABLE', 'Disable Employees', 'Allows disabling employees'),
('20000000-0000-0000-0000-000000000016', 'EMPLOYEE_USER_LINK', 'Link User Account', 'Allows linking or unlinking user accounts to employees'),

('20000000-0000-0000-0000-000000000021', 'EMPLOYEE_SKILL_READ', 'Read Employee Skills', 'Allows reading skills assigned to employees'),
('20000000-0000-0000-0000-000000000022', 'EMPLOYEE_SKILL_MANAGE', 'Manage Employee Skills', 'Allows managing skills assigned to employees'),

('20000000-0000-0000-0000-000000000031', 'EMPLOYEE_QUALIFICATION_READ', 'Read Employee Qualifications', 'Allows reading qualifications assigned to employees'),
('20000000-0000-0000-0000-000000000032', 'EMPLOYEE_QUALIFICATION_MANAGE', 'Manage Employee Qualifications', 'Allows managing qualifications assigned to employees'),

('20000000-0000-0000-0000-000000000041', 'EMPLOYEE_LEAVE_READ', 'Read Employee Leave', 'Allows reading leave records of employees'),
('20000000-0000-0000-0000-000000000042', 'EMPLOYEE_LEAVE_MANAGE', 'Manage Employee Leave', 'Allows managing leave records of employees'),

('20000000-0000-0000-0000-000000000051', 'EMPLOYEE_AVAILABILITY_READ', 'Read Employee Availability', 'Allows reading capacity and availability summaries'),

('20000000-0000-0000-0000-000000000061', 'SKILL_CATALOG_READ', 'Read Skill Catalog', 'Allows reading global skill definitions'),
('20000000-0000-0000-0000-000000000062', 'SKILL_CATALOG_MANAGE', 'Manage Skill Catalog', 'Allows creating and editing global skill definitions')
ON CONFLICT (code) DO NOTHING;

-- Map SYSTEM_ADMIN to ALL new Phase 3 permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code = 'SYSTEM_ADMIN' 
  AND p.code IN (
      'DEPARTMENT_READ', 'DEPARTMENT_CREATE', 'DEPARTMENT_UPDATE', 'DEPARTMENT_DISABLE', 'DEPARTMENT_HEAD_ASSIGN',
      'EMPLOYEE_SELF_READ', 'EMPLOYEE_READ', 'EMPLOYEE_CREATE', 'EMPLOYEE_UPDATE', 'EMPLOYEE_DISABLE', 'EMPLOYEE_USER_LINK',
      'EMPLOYEE_SKILL_READ', 'EMPLOYEE_SKILL_MANAGE', 'EMPLOYEE_QUALIFICATION_READ', 'EMPLOYEE_QUALIFICATION_MANAGE',
      'EMPLOYEE_LEAVE_READ', 'EMPLOYEE_LEAVE_MANAGE', 'EMPLOYEE_AVAILABILITY_READ',
      'SKILL_CATALOG_READ', 'SKILL_CATALOG_MANAGE'
  )
ON CONFLICT DO NOTHING;

-- Map TOP_MANAGEMENT and TECHNICAL_COORDINATOR permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code IN ('TOP_MANAGEMENT', 'TECHNICAL_COORDINATOR') 
  AND p.code IN (
      'DEPARTMENT_READ',
      'EMPLOYEE_READ',
      'EMPLOYEE_SKILL_READ',
      'EMPLOYEE_QUALIFICATION_READ',
      'EMPLOYEE_LEAVE_READ',
      'EMPLOYEE_AVAILABILITY_READ',
      'SKILL_CATALOG_READ'
  )
ON CONFLICT DO NOTHING;

-- Map HOD permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code = 'HOD' 
  AND p.code IN (
      'DEPARTMENT_READ',
      'EMPLOYEE_SELF_READ',
      'EMPLOYEE_READ',
      'EMPLOYEE_UPDATE',
      'EMPLOYEE_SKILL_READ',
      'EMPLOYEE_SKILL_MANAGE',
      'EMPLOYEE_QUALIFICATION_READ',
      'EMPLOYEE_QUALIFICATION_MANAGE',
      'EMPLOYEE_LEAVE_READ',
      'EMPLOYEE_LEAVE_MANAGE',
      'EMPLOYEE_AVAILABILITY_READ',
      'SKILL_CATALOG_READ'
  )
ON CONFLICT DO NOTHING;

-- Map ENGINEER permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code = 'ENGINEER' 
  AND p.code IN (
      'EMPLOYEE_SELF_READ',
      'EMPLOYEE_SKILL_READ',
      'EMPLOYEE_QUALIFICATION_READ',
      'SKILL_CATALOG_READ'
  )
ON CONFLICT DO NOTHING;

-- Map BDM and SALES_OFFICER permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code IN ('BDM', 'SALES_OFFICER') 
  AND p.code IN (
      'DEPARTMENT_READ',
      'EMPLOYEE_SELF_READ'
  )
ON CONFLICT DO NOTHING;
