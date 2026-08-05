-- V20__create_phase8_technical_costing_schema.sql

-- 1. Department Technical Estimates
CREATE TABLE department_technical_estimates (
    id UUID PRIMARY KEY,
    technical_project_id UUID NOT NULL,
    department_id UUID NOT NULL,
    version_number INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL CHECK (status IN ('DRAFT', 'SUBMITTED', 'REVISION_REQUESTED', 'APPROVED')),
    subtotal NUMERIC(19, 2) NOT NULL DEFAULT 0,
    contingency_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0,
    contingency_amount NUMERIC(19, 2) NOT NULL DEFAULT 0,
    tax_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(19, 2) NOT NULL DEFAULT 0,
    margin_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0,
    margin_amount NUMERIC(19, 2) NOT NULL DEFAULT 0,
    final_total NUMERIC(19, 2) NOT NULL DEFAULT 0,
    design_duration_days INTEGER NOT NULL DEFAULT 0,
    procurement_duration_days INTEGER NOT NULL DEFAULT 0,
    development_duration_days INTEGER NOT NULL DEFAULT 0,
    testing_duration_days INTEGER NOT NULL DEFAULT 0,
    installation_duration_days INTEGER NOT NULL DEFAULT 0,
    training_duration_days INTEGER NOT NULL DEFAULT 0,
    delivery_duration_days INTEGER NOT NULL DEFAULT 0,
    submitted_by UUID,
    submitted_at TIMESTAMPTZ,
    revision_notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (technical_project_id) REFERENCES technical_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (submitted_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE (technical_project_id, department_id, version_number)
);

CREATE INDEX idx_dept_tech_est_project ON department_technical_estimates(technical_project_id);
CREATE INDEX idx_dept_tech_est_department ON department_technical_estimates(department_id);
CREATE INDEX idx_dept_tech_est_status ON department_technical_estimates(status);

-- 2. Department Estimate Line Items
CREATE TABLE department_estimate_line_items (
    id UUID PRIMARY KEY,
    department_estimate_id UUID NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'MATERIALS', 'LABOUR', 'MACHINES_EQUIPMENT', 'SOFTWARE', 
        'TRANSPORT', 'INSTALLATION', 'TESTING', 'SUBCONTRACTING', 
        'MAINTENANCE', 'CONTINGENCY', 'TAX_OTHER_COSTS'
    )),
    description VARCHAR(255) NOT NULL,
    quantity NUMERIC(19, 4) NOT NULL DEFAULT 1,
    unit_of_measure VARCHAR(50) NOT NULL,
    unit_cost NUMERIC(19, 2) NOT NULL DEFAULT 0,
    total_cost NUMERIC(19, 2) NOT NULL DEFAULT 0,
    employee_allocation_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_estimate_id) REFERENCES department_technical_estimates(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_allocation_id) REFERENCES employee_allocations(id) ON DELETE SET NULL
);

CREATE INDEX idx_dept_est_item_estimate ON department_estimate_line_items(department_estimate_id);
CREATE INDEX idx_dept_est_item_category ON department_estimate_line_items(category);
CREATE INDEX idx_dept_est_item_alloc ON department_estimate_line_items(employee_allocation_id);

-- 3. Consolidated Technical Estimates
CREATE TABLE consolidated_technical_estimates (
    id UUID PRIMARY KEY,
    technical_project_id UUID NOT NULL,
    version_number INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL CHECK (status IN ('DRAFT', 'APPROVED')),
    total_materials_cost NUMERIC(19, 2) NOT NULL DEFAULT 0,
    total_labour_cost NUMERIC(19, 2) NOT NULL DEFAULT 0,
    total_machines_equipment_cost NUMERIC(19, 2) NOT NULL DEFAULT 0,
    total_software_cost NUMERIC(19, 2) NOT NULL DEFAULT 0,
    total_transport_cost NUMERIC(19, 2) NOT NULL DEFAULT 0,
    total_installation_cost NUMERIC(19, 2) NOT NULL DEFAULT 0,
    total_testing_cost NUMERIC(19, 2) NOT NULL DEFAULT 0,
    total_subcontracting_cost NUMERIC(19, 2) NOT NULL DEFAULT 0,
    total_maintenance_cost NUMERIC(19, 2) NOT NULL DEFAULT 0,
    total_contingency_cost NUMERIC(19, 2) NOT NULL DEFAULT 0,
    total_tax_other_cost NUMERIC(19, 2) NOT NULL DEFAULT 0,
    subtotal NUMERIC(19, 2) NOT NULL DEFAULT 0,
    contingency_amount NUMERIC(19, 2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(19, 2) NOT NULL DEFAULT 0,
    margin_amount NUMERIC(19, 2) NOT NULL DEFAULT 0,
    final_total NUMERIC(19, 2) NOT NULL DEFAULT 0,
    total_design_duration_days INTEGER NOT NULL DEFAULT 0,
    total_procurement_duration_days INTEGER NOT NULL DEFAULT 0,
    total_development_duration_days INTEGER NOT NULL DEFAULT 0,
    total_testing_duration_days INTEGER NOT NULL DEFAULT 0,
    total_installation_duration_days INTEGER NOT NULL DEFAULT 0,
    total_training_duration_days INTEGER NOT NULL DEFAULT 0,
    total_delivery_duration_days INTEGER NOT NULL DEFAULT 0,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (technical_project_id) REFERENCES technical_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE (technical_project_id, version_number)
);

CREATE INDEX idx_cons_tech_est_project ON consolidated_technical_estimates(technical_project_id);
CREATE INDEX idx_cons_tech_est_status ON consolidated_technical_estimates(status);

-- 4. Join table linking consolidated estimate to department estimates
CREATE TABLE consolidated_estimate_department_estimates (
    consolidated_estimate_id UUID NOT NULL,
    department_estimate_id UUID NOT NULL,
    PRIMARY KEY (consolidated_estimate_id, department_estimate_id),
    FOREIGN KEY (consolidated_estimate_id) REFERENCES consolidated_technical_estimates(id) ON DELETE CASCADE,
    FOREIGN KEY (department_estimate_id) REFERENCES department_technical_estimates(id) ON DELETE RESTRICT
);

-- 5. Permissions Setup
INSERT INTO permissions (id, code, name, description) VALUES 
('10000000-0000-0000-0000-000000000090', 'TECHNICAL_ESTIMATE_READ', 'Read Technical Estimates', 'Allows viewing department and consolidated technical estimates'),
('10000000-0000-0000-0000-000000000091', 'TECHNICAL_ESTIMATE_CREATE', 'Create Department Estimate', 'Allows creating and editing department technical estimates'),
('10000000-0000-0000-0000-000000000092', 'TECHNICAL_ESTIMATE_SUBMIT', 'Submit Department Estimate', 'Allows submitting department technical estimates'),
('10000000-0000-0000-0000-000000000093', 'TECHNICAL_ESTIMATE_REVIEW', 'Review Technical Estimates', 'Allows reviewing, requesting revision, consolidating and approving technical estimates')
ON CONFLICT (code) DO NOTHING;

-- Map SYSTEM_ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code = 'SYSTEM_ADMIN' 
  AND p.code IN (
    'TECHNICAL_ESTIMATE_READ', 'TECHNICAL_ESTIMATE_CREATE', 
    'TECHNICAL_ESTIMATE_SUBMIT', 'TECHNICAL_ESTIMATE_REVIEW'
  )
ON CONFLICT DO NOTHING;

-- Map HOD
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code = 'HOD' 
  AND p.code IN (
    'TECHNICAL_ESTIMATE_READ', 'TECHNICAL_ESTIMATE_CREATE', 
    'TECHNICAL_ESTIMATE_SUBMIT'
  )
ON CONFLICT DO NOTHING;

-- Map TECHNICAL_COORDINATOR
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code = 'TECHNICAL_COORDINATOR' 
  AND p.code IN (
    'TECHNICAL_ESTIMATE_READ', 'TECHNICAL_ESTIMATE_REVIEW'
  )
ON CONFLICT DO NOTHING;

-- Map other roles to read estimates
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code IN ('SALES_OFFICER', 'BDM', 'ENGINEER', 'TOP_MANAGEMENT') 
  AND p.code IN ('TECHNICAL_ESTIMATE_READ')
ON CONFLICT DO NOTHING;
