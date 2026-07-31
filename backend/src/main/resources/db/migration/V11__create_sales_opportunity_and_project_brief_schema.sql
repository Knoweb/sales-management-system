-- V11__create_sales_opportunity_and_project_brief_schema.sql

-- Add initial_meeting_at to leads
ALTER TABLE leads ADD COLUMN initial_meeting_at TIMESTAMPTZ;

-- Product Categories
CREATE TABLE product_categories (
    id UUID PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    system_seeded BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

CREATE UNIQUE INDEX uk_product_category_name ON product_categories(LOWER(name));

-- Sales Opportunities
CREATE TABLE sales_opportunities (
    id UUID PRIMARY KEY,
    opportunity_number VARCHAR(100) NOT NULL UNIQUE,
    lead_id UUID NOT NULL UNIQUE,
    client_id UUID NOT NULL,
    primary_contact_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    product_category_id UUID NOT NULL,
    assigned_sales_officer_id UUID,
    estimated_value NUMERIC(19, 2),
    currency VARCHAR(3),
    probability_percent INTEGER CHECK (probability_percent >= 0 AND probability_percent <= 100),
    expected_close_date DATE,
    stage VARCHAR(50) NOT NULL,
    on_hold_reason TEXT,
    lost_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    FOREIGN KEY (lead_id) REFERENCES leads(id),
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (primary_contact_id) REFERENCES client_contacts(id),
    FOREIGN KEY (product_category_id) REFERENCES product_categories(id),
    FOREIGN KEY (assigned_sales_officer_id) REFERENCES employees(id)
);

CREATE INDEX idx_opp_number ON sales_opportunities(opportunity_number);
CREATE INDEX idx_opp_stage ON sales_opportunities(stage);
CREATE INDEX idx_opp_assigned ON sales_opportunities(assigned_sales_officer_id);

-- Opportunity Activities
CREATE TABLE opportunity_activities (
    id UUID PRIMARY KEY,
    opportunity_id UUID NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    activity_date TIMESTAMPTZ NOT NULL,
    description TEXT NOT NULL,
    details JSONB,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (opportunity_id) REFERENCES sales_opportunities(id) ON DELETE CASCADE
);

CREATE INDEX idx_opp_act_opp_id ON opportunity_activities(opportunity_id);

-- Project Briefs
CREATE TABLE project_briefs (
    id UUID PRIMARY KEY,
    opportunity_id UUID NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL,
    current_version_number INTEGER NOT NULL DEFAULT 0,
    project_title VARCHAR(255),
    business_problem TEXT,
    required_solution TEXT,
    project_scope TEXT,
    technical_requirements TEXT,
    expected_budget NUMERIC(19, 2),
    currency VARCHAR(3),
    expected_deadline DATE,
    site_name VARCHAR(255),
    site_address TEXT,
    site_information TEXT,
    meeting_notes TEXT,
    special_conditions TEXT,
    due_at TIMESTAMPTZ NOT NULL,
    submitted_at TIMESTAMPTZ,
    submitted_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    FOREIGN KEY (opportunity_id) REFERENCES sales_opportunities(id),
    FOREIGN KEY (submitted_by) REFERENCES users(id)
);

CREATE INDEX idx_pb_status ON project_briefs(status);
CREATE INDEX idx_pb_due_at ON project_briefs(due_at);

-- Project Brief Departments
CREATE TABLE project_brief_departments (
    project_brief_id UUID NOT NULL,
    department_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    PRIMARY KEY (project_brief_id, department_id),
    FOREIGN KEY (project_brief_id) REFERENCES project_briefs(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Project Brief Versions
CREATE TABLE project_brief_versions (
    id UUID PRIMARY KEY,
    project_brief_id UUID NOT NULL,
    version_number INTEGER NOT NULL,
    snapshot JSONB NOT NULL,
    change_summary TEXT,
    submitted_version BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    FOREIGN KEY (project_brief_id) REFERENCES project_briefs(id) ON DELETE CASCADE,
    CONSTRAINT uk_pb_version UNIQUE (project_brief_id, version_number)
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    recipient_user_id UUID NOT NULL,
    notification_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    deduplication_key VARCHAR(255),
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notif_recipient ON notifications(recipient_user_id);
CREATE INDEX idx_notif_dedup ON notifications(deduplication_key);
