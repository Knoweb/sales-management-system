-- V16__create_phase7_technical_routing_schema.sql

-- 1. Technical Projects
CREATE TABLE technical_projects (
    id UUID PRIMARY KEY,
    project_code VARCHAR(255) NOT NULL UNIQUE,
    project_brief_id UUID NOT NULL UNIQUE,
    sales_opportunity_id UUID,
    technical_coordinator_id UUID,
    status VARCHAR(50) NOT NULL CHECK (status IN ('AWAITING_TECHNICAL_ROUTING', 'ROUTED', 'TEAM_FORMATION_IN_PROGRESS', 'TEAM_READY')),
    routed_at TIMESTAMPTZ,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (project_brief_id) REFERENCES project_briefs(id),
    FOREIGN KEY (sales_opportunity_id) REFERENCES sales_opportunities(id),
    FOREIGN KEY (technical_coordinator_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_technical_projects_status ON technical_projects(status);
CREATE INDEX idx_technical_projects_coordinator ON technical_projects(technical_coordinator_id);
CREATE INDEX idx_technical_projects_brief ON technical_projects(project_brief_id);
CREATE INDEX idx_technical_projects_opportunity ON technical_projects(sales_opportunity_id);
CREATE INDEX idx_technical_projects_routed_at ON technical_projects(routed_at);

-- 2. Technical Project Departments
CREATE TABLE technical_project_departments (
    id UUID PRIMARY KEY,
    technical_project_id UUID NOT NULL,
    department_id UUID NOT NULL,
    required_scope TEXT NOT NULL CHECK (trim(required_scope) <> ''),
    expected_estimate_submission_date DATE NOT NULL,
    routing_notes TEXT,
    formation_status VARCHAR(50) NOT NULL CHECK (formation_status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED')),
    assigned_by UUID,
    assigned_at TIMESTAMPTZ,
    submitted_by UUID,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (technical_project_id) REFERENCES technical_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (assigned_by) REFERENCES users(id),
    FOREIGN KEY (submitted_by) REFERENCES users(id),
    UNIQUE (technical_project_id, department_id)
);

CREATE INDEX idx_tech_proj_dept_project ON technical_project_departments(technical_project_id);
CREATE INDEX idx_tech_proj_dept_department ON technical_project_departments(department_id);
CREATE INDEX idx_tech_proj_dept_status ON technical_project_departments(formation_status);
CREATE INDEX idx_tech_proj_dept_est_date ON technical_project_departments(expected_estimate_submission_date);

-- 3. Project Teams
CREATE TABLE project_teams (
    id UUID PRIMARY KEY,
    technical_project_department_id UUID NOT NULL UNIQUE,
    team_name VARCHAR(255),
    status VARCHAR(50) NOT NULL CHECK (status IN ('DRAFT', 'READY')),
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (technical_project_department_id) REFERENCES technical_project_departments(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_project_teams_status ON project_teams(status);
CREATE INDEX idx_project_teams_created_by ON project_teams(created_by);

-- 4. Project Team Members
CREATE TABLE project_team_members (
    id UUID PRIMARY KEY,
    project_team_id UUID NOT NULL,
    employee_id UUID NOT NULL,
    project_role VARCHAR(100) NOT NULL CHECK (project_role IN (
        'PROJECT_MANAGER', 'PROJECT_ENGINEER', 'MECHANICAL_ENGINEER', 
        'ELECTRICAL_ENGINEER', 'ELECTRONIC_ENGINEER', 'SOFTWARE_ENGINEER', 
        'TECHNICIAN', 'WELDER', 'ASSISTANT', 'SITE_SUPERVISOR', 
        'QUALITY_CONTROLLER', 'OTHER'
    )),
    allocation_start_date DATE NOT NULL,
    allocation_end_date DATE NOT NULL,
    assigned_hours NUMERIC(19, 2) NOT NULL CHECK (assigned_hours > 0),
    is_primary_member BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REMOVED')),
    added_by UUID,
    added_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_team_id) REFERENCES project_teams(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (added_by) REFERENCES users(id),
    CHECK (allocation_start_date <= allocation_end_date)
);

CREATE INDEX idx_team_members_team ON project_team_members(project_team_id);
CREATE INDEX idx_team_members_employee ON project_team_members(employee_id);
CREATE INDEX idx_team_members_status ON project_team_members(status);
CREATE INDEX idx_team_members_dates ON project_team_members(allocation_start_date, allocation_end_date);

CREATE UNIQUE INDEX uk_active_team_member 
ON project_team_members(project_team_id, employee_id) 
WHERE status = 'ACTIVE';

-- 5. Employee Allocations
CREATE TABLE employee_allocations (
    id UUID PRIMARY KEY,
    employee_id UUID NOT NULL,
    technical_project_id UUID NOT NULL,
    project_team_id UUID NOT NULL,
    department_id UUID NOT NULL,
    allocation_start_date DATE NOT NULL,
    allocation_end_date DATE NOT NULL,
    assigned_hours NUMERIC(19, 2) NOT NULL CHECK (assigned_hours > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CANCELLED')),
    override_flag BOOLEAN NOT NULL DEFAULT false,
    override_reason TEXT,
    overridden_by UUID,
    overridden_at TIMESTAMPTZ,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (technical_project_id) REFERENCES technical_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (project_team_id) REFERENCES project_teams(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (overridden_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    CHECK (allocation_start_date <= allocation_end_date),
    CHECK (
        (override_flag = false AND override_reason IS NULL AND overridden_by IS NULL AND overridden_at IS NULL) OR 
        (override_flag = true AND override_reason IS NOT NULL AND overridden_by IS NOT NULL AND overridden_at IS NOT NULL)
    )
);

CREATE INDEX idx_employee_alloc_employee ON employee_allocations(employee_id);
CREATE INDEX idx_employee_alloc_project ON employee_allocations(technical_project_id);
CREATE INDEX idx_employee_alloc_team ON employee_allocations(project_team_id);
CREATE INDEX idx_employee_alloc_department ON employee_allocations(department_id);
CREATE INDEX idx_employee_alloc_status ON employee_allocations(status);
CREATE INDEX idx_employee_alloc_dates ON employee_allocations(allocation_start_date, allocation_end_date);
CREATE INDEX idx_employee_alloc_overlap ON employee_allocations(employee_id, allocation_start_date, allocation_end_date);

CREATE UNIQUE INDEX uk_active_employee_allocation 
ON employee_allocations(employee_id, project_team_id, allocation_start_date, allocation_end_date) 
WHERE status = 'ACTIVE';

-- 6. Technical Project History
CREATE TABLE technical_project_history (
    id UUID PRIMARY KEY,
    technical_project_id UUID NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    previous_value JSONB,
    new_value JSONB,
    reason TEXT,
    acted_by UUID,
    acted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (technical_project_id) REFERENCES technical_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (acted_by) REFERENCES users(id)
);

CREATE INDEX idx_tech_proj_history_project ON technical_project_history(technical_project_id);
CREATE INDEX idx_tech_proj_history_entity ON technical_project_history(entity_type, entity_id);

-- 7. Permissions Setup
INSERT INTO permissions (id, code, name, description) VALUES 
('10000000-0000-0000-0000-000000000080', 'TECHNICAL_PROJECT_READ', 'Read Technical Projects', 'Allows viewing technical projects'),
('10000000-0000-0000-0000-000000000081', 'TECHNICAL_PROJECT_ROUTE', 'Route Technical Project', 'Allows initial technical routing to departments'),
('10000000-0000-0000-0000-000000000082', 'TECHNICAL_PROJECT_ROUTING_REVISE', 'Revise Technical Routing', 'Allows revising an existing routing'),
('10000000-0000-0000-0000-000000000083', 'PROJECT_TEAM_READ', 'Read Project Team', 'Allows viewing project teams'),
('10000000-0000-0000-0000-000000000084', 'PROJECT_TEAM_MANAGE', 'Manage Project Team', 'Allows managing project teams'),
('10000000-0000-0000-0000-000000000085', 'EMPLOYEE_ALLOCATION_READ', 'Read Employee Allocations', 'Allows viewing employee allocations'),
('10000000-0000-0000-0000-000000000086', 'EMPLOYEE_ALLOCATION_MANAGE', 'Manage Employee Allocations', 'Allows managing employee allocations'),
('10000000-0000-0000-0000-000000000087', 'EMPLOYEE_ALLOCATION_OVERRIDE', 'Override Employee Allocations', 'Allows overriding employee over-allocation warnings')
ON CONFLICT (code) DO NOTHING;

-- Map SYSTEM_ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code = 'SYSTEM_ADMIN' 
  AND p.code IN (
    'TECHNICAL_PROJECT_READ', 'TECHNICAL_PROJECT_ROUTE', 'TECHNICAL_PROJECT_ROUTING_REVISE', 
    'PROJECT_TEAM_READ', 'PROJECT_TEAM_MANAGE', 'EMPLOYEE_ALLOCATION_READ', 
    'EMPLOYEE_ALLOCATION_MANAGE', 'EMPLOYEE_ALLOCATION_OVERRIDE'
  )
ON CONFLICT DO NOTHING;

-- Map TECHNICAL_COORDINATOR
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code = 'TECHNICAL_COORDINATOR' 
  AND p.code IN (
    'TECHNICAL_PROJECT_READ', 'TECHNICAL_PROJECT_ROUTE', 'TECHNICAL_PROJECT_ROUTING_REVISE', 
    'PROJECT_TEAM_READ'
  )
ON CONFLICT DO NOTHING;

-- Map HOD
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code = 'HOD' 
  AND p.code IN (
    'TECHNICAL_PROJECT_READ', 'PROJECT_TEAM_READ', 'PROJECT_TEAM_MANAGE', 
    'EMPLOYEE_ALLOCATION_READ', 'EMPLOYEE_ALLOCATION_MANAGE', 'EMPLOYEE_ALLOCATION_OVERRIDE'
  )
ON CONFLICT DO NOTHING;

-- Map ENGINEER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code = 'ENGINEER' 
  AND p.code IN (
    'TECHNICAL_PROJECT_READ', 'PROJECT_TEAM_READ', 'EMPLOYEE_ALLOCATION_READ'
  )
ON CONFLICT DO NOTHING;

-- Map SALES_OFFICER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code = 'SALES_OFFICER' 
  AND p.code IN (
    'TECHNICAL_PROJECT_READ'
  )
ON CONFLICT DO NOTHING;

-- Map BDM
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code = 'BDM' 
  AND p.code IN (
    'TECHNICAL_PROJECT_READ'
  )
ON CONFLICT DO NOTHING;
