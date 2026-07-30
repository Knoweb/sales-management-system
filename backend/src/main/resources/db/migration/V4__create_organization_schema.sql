-- V4__create_organization_schema.sql

CREATE TABLE departments (
    id UUID PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    system_seeded BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    created_by UUID,
    updated_by UUID,
    CONSTRAINT uq_departments_code UNIQUE (code),
    CONSTRAINT chk_departments_code_upper CHECK (code = upper(code))
);

CREATE UNIQUE INDEX idx_departments_name_lower ON departments (LOWER(name));
CREATE INDEX idx_departments_active ON departments (active);

CREATE TABLE employees (
    id UUID PRIMARY KEY,
    employee_number VARCHAR(50) NOT NULL,
    user_id UUID,
    department_id UUID NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    work_email VARCHAR(255),
    personal_email VARCHAR(255),
    contact_number VARCHAR(50),
    job_title VARCHAR(100) NOT NULL,
    employment_type VARCHAR(50) NOT NULL,
    employment_status VARCHAR(50) NOT NULL,
    hire_date DATE,
    weekly_capacity_hours NUMERIC(5, 2) NOT NULL DEFAULT 40.00,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    created_by UUID,
    updated_by UUID,
    CONSTRAINT uq_employees_emp_number UNIQUE (employee_number),
    CONSTRAINT uq_employees_user_id UNIQUE (user_id),
    CONSTRAINT fk_employees_department FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT fk_employees_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT chk_employees_capacity CHECK (weekly_capacity_hours > 0 AND weekly_capacity_hours <= 168),
    CONSTRAINT chk_employees_work_email_lower CHECK (work_email IS NULL OR work_email = lower(work_email))
);

CREATE UNIQUE INDEX idx_employees_work_email_lower ON employees (LOWER(work_email)) WHERE work_email IS NOT NULL;
CREATE INDEX idx_employees_department_id ON employees (department_id);
CREATE INDEX idx_employees_status ON employees (employment_status);

CREATE TABLE department_heads (
    id UUID PRIMARY KEY,
    department_id UUID NOT NULL,
    employee_id UUID NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    assigned_at TIMESTAMPTZ NOT NULL,
    assigned_by UUID,
    ended_at TIMESTAMPTZ,
    CONSTRAINT fk_dept_heads_department FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT fk_dept_heads_employee FOREIGN KEY (employee_id) REFERENCES employees(id),
    CONSTRAINT fk_dept_heads_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id)
);

CREATE UNIQUE INDEX idx_dept_heads_active ON department_heads (department_id) WHERE active = true;

CREATE TABLE skills (
    id UUID PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uq_skills_code UNIQUE (code),
    CONSTRAINT chk_skills_code_upper CHECK (code = upper(code))
);

CREATE UNIQUE INDEX idx_skills_name_lower ON skills (LOWER(name));

CREATE TABLE employee_skills (
    id UUID PRIMARY KEY,
    employee_id UUID NOT NULL,
    skill_id UUID NOT NULL,
    proficiency_level VARCHAR(50) NOT NULL,
    years_of_experience NUMERIC(4, 1),
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by UUID,
    verified_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_emp_skills_emp FOREIGN KEY (employee_id) REFERENCES employees(id),
    CONSTRAINT fk_emp_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(id),
    CONSTRAINT fk_emp_skills_verified_by FOREIGN KEY (verified_by) REFERENCES users(id),
    CONSTRAINT uq_emp_skills_emp_skill UNIQUE (employee_id, skill_id),
    CONSTRAINT chk_emp_skills_exp CHECK (years_of_experience IS NULL OR years_of_experience >= 0)
);

CREATE TABLE employee_qualifications (
    id UUID PRIMARY KEY,
    employee_id UUID NOT NULL,
    qualification_name VARCHAR(255) NOT NULL,
    institution VARCHAR(255),
    field_of_study VARCHAR(255),
    qualification_level VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    credential_number VARCHAR(100),
    notes TEXT,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by UUID,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_emp_quals_emp FOREIGN KEY (employee_id) REFERENCES employees(id),
    CONSTRAINT fk_emp_quals_verified_by FOREIGN KEY (verified_by) REFERENCES users(id),
    CONSTRAINT chk_emp_quals_dates CHECK (expiry_date IS NULL OR issue_date IS NULL OR expiry_date >= issue_date)
);

CREATE TABLE employee_leaves (
    id UUID PRIMARY KEY,
    employee_id UUID NOT NULL,
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    partial_day BOOLEAN NOT NULL DEFAULT FALSE,
    leave_hours NUMERIC(5, 2),
    status VARCHAR(50) NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    created_by UUID,
    updated_by UUID,
    CONSTRAINT fk_emp_leaves_emp FOREIGN KEY (employee_id) REFERENCES employees(id),
    CONSTRAINT chk_emp_leaves_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_emp_leaves_dates ON employee_leaves (employee_id, start_date, end_date);
