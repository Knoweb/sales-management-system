-- ==========================================
-- Phase 11: Project Execution Schema
-- ==========================================

-- 1. Project Execution Workspaces
CREATE TABLE project_execution_workspaces (
    id UUID PRIMARY KEY,
    technical_project_id UUID NOT NULL UNIQUE REFERENCES technical_projects(id),
    project_manager_id UUID REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'PLANNED',
    planned_start_date DATE,
    planned_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    overall_progress DECIMAL(5,2) DEFAULT 0.00,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version INTEGER NOT NULL DEFAULT 0
);

-- 2. Employee Allocations
CREATE TABLE project_employee_allocations (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES project_execution_workspaces(id),
    employee_id UUID NOT NULL REFERENCES users(id),
    department_id UUID NOT NULL REFERENCES departments(id),
    role_description VARCHAR(255),
    allocation_percentage DECIMAL(5,2),
    allocated_hours DECIMAL(10,2),
    allocation_start_date DATE,
    allocation_end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    allocated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version INTEGER NOT NULL DEFAULT 0
);

-- 3. Project Tasks
CREATE TABLE project_tasks (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES project_execution_workspaces(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    department_id UUID REFERENCES departments(id),
    assignee_id UUID REFERENCES users(id),
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(50) NOT NULL DEFAULT 'TODO',
    planned_start_date DATE,
    planned_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    estimated_hours DECIMAL(10,2),
    actual_hours DECIMAL(10,2) DEFAULT 0.00,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version INTEGER NOT NULL DEFAULT 0
);

-- 4. Task Dependencies
CREATE TABLE project_task_dependencies (
    id UUID PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES project_tasks(id),
    predecessor_task_id UUID NOT NULL REFERENCES project_tasks(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE(task_id, predecessor_task_id)
);

-- 5. Task Status History
CREATE TABLE task_status_history (
    id UUID PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES project_tasks(id),
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    previous_percentage DECIMAL(5,2),
    new_percentage DECIMAL(5,2) NOT NULL,
    comment TEXT,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 6. Daily Progress Updates
CREATE TABLE daily_progress_updates (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES project_execution_workspaces(id),
    task_id UUID REFERENCES project_tasks(id),
    employee_id UUID NOT NULL REFERENCES users(id),
    progress_date DATE NOT NULL,
    work_completed TEXT NOT NULL,
    work_planned_next TEXT,
    blockers TEXT,
    completion_percentage DECIMAL(5,2),
    hours_worked DECIMAL(10,2),
    submitted_by UUID REFERENCES users(id),
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 7. Labour Entries
CREATE TABLE project_labour_entries (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES project_execution_workspaces(id),
    task_id UUID REFERENCES project_tasks(id),
    employee_id UUID NOT NULL REFERENCES users(id),
    work_date DATE NOT NULL,
    hours DECIMAL(10,2) NOT NULL,
    description TEXT,
    approval_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    submitted_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version INTEGER NOT NULL DEFAULT 0
);

-- 8. Material Usages
CREATE TABLE project_material_usages (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES project_execution_workspaces(id),
    task_id UUID REFERENCES project_tasks(id),
    material_code VARCHAR(100),
    material_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(19,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    unit_cost DECIMAL(19,2) NOT NULL,
    total_cost DECIMAL(19,2) NOT NULL,
    usage_date DATE NOT NULL,
    recorded_by UUID REFERENCES users(id),
    approval_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version INTEGER NOT NULL DEFAULT 0
);

-- 9. Issues
CREATE TABLE project_issues (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES project_execution_workspaces(id),
    task_id UUID REFERENCES project_tasks(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    owner_id UUID REFERENCES users(id),
    reported_by UUID REFERENCES users(id),
    reported_date TIMESTAMP WITH TIME ZONE NOT NULL,
    resolved_date TIMESTAMP WITH TIME ZONE,
    resolution_note TEXT,
    version INTEGER NOT NULL DEFAULT 0
);

-- 10. Delay Reports
CREATE TABLE project_delay_reports (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES project_execution_workspaces(id),
    task_id UUID REFERENCES project_tasks(id),
    reason TEXT NOT NULL,
    expected_delay_days INTEGER NOT NULL,
    revised_expected_date DATE,
    impact_description TEXT,
    mitigation_plan TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'REPORTED',
    reported_by UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version INTEGER NOT NULL DEFAULT 0
);

-- 11. Execution Attachments
CREATE TABLE project_execution_attachments (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES project_execution_workspaces(id),
    task_id UUID REFERENCES project_tasks(id),
    attachment_type VARCHAR(50) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    storage_reference VARCHAR(512) NOT NULL,
    mime_type VARCHAR(100),
    file_size BIGINT,
    description TEXT,
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 12. Approval Requests
CREATE TABLE project_approval_requests (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES project_execution_workspaces(id),
    task_id UUID REFERENCES project_tasks(id),
    approval_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    requested_by UUID REFERENCES users(id),
    assigned_approver_id UUID REFERENCES users(id),
    submitted_date TIMESTAMP WITH TIME ZONE,
    decision_date TIMESTAMP WITH TIME ZONE,
    decision_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version INTEGER NOT NULL DEFAULT 0
);

-- 13. Change Requests
CREATE TABLE project_change_requests (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES project_execution_workspaces(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reason TEXT,
    impact_description TEXT,
    estimated_cost_impact DECIMAL(19,2),
    estimated_schedule_impact_days INTEGER,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    requested_by UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    submitted_date TIMESTAMP WITH TIME ZONE,
    reviewed_date TIMESTAMP WITH TIME ZONE,
    decision_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE project_change_request_history (
    id UUID PRIMARY KEY,
    change_request_id UUID NOT NULL REFERENCES project_change_requests(id),
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    comment TEXT,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Permissions
INSERT INTO permissions (id, code, name, description) VALUES 
(gen_random_uuid(), 'PROJECT_EXECUTION_READ', 'Read Project Execution', 'Can view project execution workspaces and tasks'),
(gen_random_uuid(), 'PROJECT_EXECUTION_WRITE', 'Write Project Execution', 'Can manage project execution workspaces and tasks'),
(gen_random_uuid(), 'PROJECT_EXECUTION_APPROVE', 'Approve Project Execution', 'Can approve execution requests, delays, and labour entries');

-- Assign permissions to System Admin (Assuming Role name 'System Administrator' or code 'SYS_ADMIN')
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'SYS_ADMIN' AND p.code IN ('PROJECT_EXECUTION_READ', 'PROJECT_EXECUTION_WRITE', 'PROJECT_EXECUTION_APPROVE');
