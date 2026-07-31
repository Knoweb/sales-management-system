-- V12__seed_product_categories_and_phase5_permissions.sql

-- Seed Product Categories
INSERT INTO product_categories (id, code, name, description, active, system_seeded) VALUES 
('20000000-0000-0000-0000-000000000001', 'STANDARD_SAAS', 'Standard SaaS Products', 'Standard software as a service products', true, true),
('20000000-0000-0000-0000-000000000002', 'CUSTOM_SOFTWARE', 'Custom Software Solutions', 'Bespoke software development', true, true),
('20000000-0000-0000-0000-000000000003', 'CORPORATE_SOLUTIONS', 'Corporate Solutions', 'Enterprise corporate solutions', true, true),
('20000000-0000-0000-0000-000000000004', 'NO_WEB_SOLUTIONS', 'NO WEB Solutions', 'Non-web technology solutions', true, true),
('20000000-0000-0000-0000-000000000005', 'MECHANICAL_PRODUCTS', 'Mechanical Products', 'Mechanical engineering products', true, true),
('20000000-0000-0000-0000-000000000006', 'ELECTRICAL_SOLUTIONS', 'Electrical Solutions', 'Electrical engineering solutions', true, true),
('20000000-0000-0000-0000-000000000007', 'ELECTRONIC_SOLUTIONS', 'Electronic Solutions', 'Electronic products and services', true, true),
('20000000-0000-0000-0000-000000000008', 'AUTOMATION_PROJECTS', 'Automation Projects', 'Industrial or corporate automation', true, true),
('20000000-0000-0000-0000-000000000009', 'MAINTENANCE_SERVICES', 'Maintenance Services', 'Ongoing maintenance and support', true, true),
('20000000-0000-0000-0000-000000000010', 'INSTALLATION_SERVICES', 'Installation Services', 'Equipment and software installation', true, true)
ON CONFLICT (code) DO NOTHING;

-- Seed Phase 5 Permissions
INSERT INTO permissions (id, code, name, description) VALUES 
('10000000-0000-0000-0000-000000000050', 'OPPORTUNITY_READ', 'Read Opportunities', 'Allows reading sales opportunities'),
('10000000-0000-0000-0000-000000000051', 'OPPORTUNITY_CREATE', 'Create Opportunities', 'Allows converting leads to opportunities'),
('10000000-0000-0000-0000-000000000052', 'OPPORTUNITY_UPDATE', 'Update Opportunities', 'Allows updating opportunity details'),
('10000000-0000-0000-0000-000000000053', 'OPPORTUNITY_STATUS_UPDATE', 'Update Opportunity Status', 'Allows changing the stage of an opportunity'),
('10000000-0000-0000-0000-000000000054', 'OPPORTUNITY_ASSIGN', 'Assign Opportunities', 'Allows assigning an opportunity to a sales officer'),
('10000000-0000-0000-0000-000000000055', 'OPPORTUNITY_ACTIVITY_READ', 'Read Opportunity Activity', 'Allows reading activity history for an opportunity'),
('10000000-0000-0000-0000-000000000056', 'PROJECT_BRIEF_READ', 'Read Project Briefs', 'Allows reading project briefs'),
('10000000-0000-0000-0000-000000000057', 'PROJECT_BRIEF_CREATE', 'Create Project Briefs', 'Allows creating project briefs (often done via conversion)'),
('10000000-0000-0000-0000-000000000058', 'PROJECT_BRIEF_UPDATE', 'Update Project Briefs', 'Allows saving drafts of project briefs'),
('10000000-0000-0000-0000-000000000059', 'PROJECT_BRIEF_SUBMIT', 'Submit Project Briefs', 'Allows finalizing and submitting a project brief'),
('10000000-0000-0000-0000-000000000060', 'PROJECT_BRIEF_VERSION_READ', 'Read Project Brief Versions', 'Allows reading historical versions of project briefs'),
('10000000-0000-0000-0000-000000000061', 'PROJECT_BRIEF_ATTACHMENT_MANAGE', 'Manage Project Brief Attachments', 'Allows uploading and deleting project brief attachments'),
('10000000-0000-0000-0000-000000000062', 'PROJECT_BRIEF_OVERDUE_READ', 'Read Overdue Project Briefs', 'Allows viewing overdue project brief statuses globally'),
('10000000-0000-0000-0000-000000000063', 'PRODUCT_CATEGORY_READ', 'Read Product Categories', 'Allows viewing available product categories'),
('10000000-0000-0000-0000-000000000064', 'PRODUCT_CATEGORY_MANAGE', 'Manage Product Categories', 'Allows creating and updating product categories'),
('10000000-0000-0000-0000-000000000065', 'NOTIFICATION_SELF_READ', 'Read Own Notifications', 'Allows a user to view their own notifications'),
('10000000-0000-0000-0000-000000000066', 'NOTIFICATION_SELF_UPDATE', 'Update Own Notifications', 'Allows a user to mark their notifications as read')
ON CONFLICT (code) DO NOTHING;

-- Map SYSTEM_ADMIN (All Phase 5 Permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code = 'SYSTEM_ADMIN' 
  AND p.code IN (
    'OPPORTUNITY_READ', 'OPPORTUNITY_CREATE', 'OPPORTUNITY_UPDATE', 'OPPORTUNITY_STATUS_UPDATE', 
    'OPPORTUNITY_ASSIGN', 'OPPORTUNITY_ACTIVITY_READ', 'PROJECT_BRIEF_READ', 'PROJECT_BRIEF_CREATE', 
    'PROJECT_BRIEF_UPDATE', 'PROJECT_BRIEF_SUBMIT', 'PROJECT_BRIEF_VERSION_READ', 'PROJECT_BRIEF_ATTACHMENT_MANAGE', 
    'PROJECT_BRIEF_OVERDUE_READ', 'PRODUCT_CATEGORY_READ', 'PRODUCT_CATEGORY_MANAGE', 
    'NOTIFICATION_SELF_READ', 'NOTIFICATION_SELF_UPDATE'
  )
ON CONFLICT DO NOTHING;

-- Map SALES_OFFICER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code = 'SALES_OFFICER' 
  AND p.code IN (
    'OPPORTUNITY_READ', 'OPPORTUNITY_CREATE', 'OPPORTUNITY_UPDATE', 'OPPORTUNITY_STATUS_UPDATE', 
    'OPPORTUNITY_ACTIVITY_READ', 'PROJECT_BRIEF_READ', 'PROJECT_BRIEF_CREATE', 'PROJECT_BRIEF_UPDATE', 
    'PROJECT_BRIEF_SUBMIT', 'PROJECT_BRIEF_VERSION_READ', 'PROJECT_BRIEF_ATTACHMENT_MANAGE', 
    'PROJECT_BRIEF_OVERDUE_READ', 'PRODUCT_CATEGORY_READ', 'NOTIFICATION_SELF_READ', 'NOTIFICATION_SELF_UPDATE'
  )
ON CONFLICT DO NOTHING;

-- Map BDM
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code = 'BDM' 
  AND p.code IN (
    'OPPORTUNITY_READ', 'OPPORTUNITY_ASSIGN', 'OPPORTUNITY_ACTIVITY_READ', 'PROJECT_BRIEF_READ', 
    'PROJECT_BRIEF_VERSION_READ', 'PROJECT_BRIEF_OVERDUE_READ', 'PRODUCT_CATEGORY_READ', 
    'NOTIFICATION_SELF_READ', 'NOTIFICATION_SELF_UPDATE'
  )
ON CONFLICT DO NOTHING;

-- Map TOP_MANAGEMENT
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code = 'TOP_MANAGEMENT' 
  AND p.code IN (
    'OPPORTUNITY_READ', 'OPPORTUNITY_ACTIVITY_READ', 'PROJECT_BRIEF_READ', 'PROJECT_BRIEF_VERSION_READ', 
    'PROJECT_BRIEF_OVERDUE_READ', 'PRODUCT_CATEGORY_READ', 'NOTIFICATION_SELF_READ', 'NOTIFICATION_SELF_UPDATE'
  )
ON CONFLICT DO NOTHING;
