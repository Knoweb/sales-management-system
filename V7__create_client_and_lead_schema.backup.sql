-- Clients
CREATE TABLE clients (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    registration_number VARCHAR(100),
    industry VARCHAR(100),
    address TEXT,
    client_type VARCHAR(50) NOT NULL CHECK (client_type IN ('INDIVIDUAL', 'COMPANY', 'GOVERNMENT', 'NON_PROFIT', 'OTHER')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID,
    updated_by UUID
);

CREATE INDEX idx_clients_name ON clients (name);
CREATE UNIQUE INDEX idx_clients_email_active ON clients (email) WHERE is_active = true;
CREATE UNIQUE INDEX idx_clients_reg_number_active ON clients (registration_number) WHERE is_active = true;

-- Client Contacts
CREATE TABLE client_contacts (
    id UUID PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    job_title VARCHAR(100),
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID,
    updated_by UUID
);

CREATE INDEX idx_client_contacts_client_id ON client_contacts (client_id);

-- Leads
CREATE TABLE leads (
    id UUID PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id),
    title VARCHAR(255) NOT NULL,
    inquiry_source VARCHAR(50) NOT NULL CHECK (inquiry_source IN ('WEBSITE', 'REFERRAL', 'COLD_CALL', 'EVENT', 'OTHER')),
    interested_product VARCHAR(255),
    initial_request TEXT,
    status VARCHAR(50) NOT NULL CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'CLOSED_WON', 'CLOSED_LOST')),
    assigned_to UUID REFERENCES employees(id),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID,
    updated_by UUID
);

CREATE INDEX idx_leads_client_id ON leads (client_id);
CREATE INDEX idx_leads_assigned_to ON leads (assigned_to);
CREATE INDEX idx_leads_status ON leads (status);

-- Lead Activities
CREATE TABLE lead_activities (
    id UUID PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('CALL', 'EMAIL', 'MEETING', 'NOTE', 'SYSTEM_EVENT')),
    description TEXT NOT NULL,
    activity_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID,
    updated_by UUID
);

CREATE INDEX idx_lead_activities_lead_id ON lead_activities (lead_id);

-- Follow Ups
CREATE TABLE follow_ups (
    id UUID PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    follow_up_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
    notes TEXT,
    assigned_to UUID REFERENCES employees(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID,
    updated_by UUID
);

CREATE INDEX idx_follow_ups_lead_id ON follow_ups (lead_id);
CREATE INDEX idx_follow_ups_assigned_to ON follow_ups (assigned_to);
CREATE INDEX idx_follow_ups_date ON follow_ups (follow_up_date);

-- Attachments
CREATE TABLE attachments (
    id UUID PRIMARY KEY,
    entity_id UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID,
    updated_by UUID
);

CREATE INDEX idx_attachments_entity ON attachments (entity_id, entity_type);

-- Seed Phase 4 Permissions
INSERT INTO permissions (id, code, name, description) VALUES 
('40000000-0000-0000-0000-000000000001', 'CLIENT_READ', 'Read Clients', 'Allows reading clients and contacts'),
('40000000-0000-0000-0000-000000000002', 'CLIENT_CREATE', 'Create Clients', 'Allows creating new clients'),
('40000000-0000-0000-0000-000000000003', 'CLIENT_UPDATE', 'Update Clients', 'Allows updating clients and contacts'),
('40000000-0000-0000-0000-000000000004', 'CLIENT_DELETE', 'Delete Clients', 'Allows deleting clients'),
('40000000-0000-0000-0000-000000000005', 'LEAD_READ', 'Read Leads', 'Allows reading own leads'),
('40000000-0000-0000-0000-000000000006', 'LEAD_READ_ALL', 'Read All Leads', 'Allows reading all leads across the organization'),
('40000000-0000-0000-0000-000000000007', 'LEAD_CREATE', 'Create Leads', 'Allows creating new leads'),
('40000000-0000-0000-0000-000000000008', 'LEAD_UPDATE', 'Update Leads', 'Allows updating own leads'),
('40000000-0000-0000-0000-000000000009', 'LEAD_UPDATE_ALL', 'Update All Leads', 'Allows updating all leads across the organization'),
('40000000-0000-0000-0000-000000000010', 'LEAD_DELETE', 'Delete Leads', 'Allows deleting leads'),
('40000000-0000-0000-0000-000000000011', 'LEAD_ASSIGN', 'Assign Leads', 'Allows assigning leads to employees'),
('40000000-0000-0000-0000-000000000012', 'LEAD_ACTIVITY_CREATE', 'Log Lead Activity', 'Allows logging activities on leads'),
('40000000-0000-0000-0000-000000000013', 'FOLLOW_UP_MANAGE', 'Manage Follow Ups', 'Allows creating and updating follow ups'),
('40000000-0000-0000-0000-000000000014', 'ATTACHMENT_MANAGE', 'Manage Attachments', 'Allows uploading and managing attachments')
ON CONFLICT (code) DO NOTHING;

-- Grant ALL Phase 4 permissions to SYSTEM_ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code = 'SYSTEM_ADMIN' 
  AND p.code IN (
      'CLIENT_READ', 'CLIENT_CREATE', 'CLIENT_UPDATE', 'CLIENT_DELETE',
      'LEAD_READ', 'LEAD_READ_ALL', 'LEAD_CREATE', 'LEAD_UPDATE', 'LEAD_UPDATE_ALL', 'LEAD_DELETE', 'LEAD_ASSIGN',
      'LEAD_ACTIVITY_CREATE', 'FOLLOW_UP_MANAGE', 'ATTACHMENT_MANAGE'
  )
ON CONFLICT DO NOTHING;

-- Grant SALES_OFFICER permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code = 'SALES_OFFICER' 
  AND p.code IN (
      'CLIENT_READ', 'CLIENT_CREATE', 'CLIENT_UPDATE',
      'LEAD_READ', 'LEAD_CREATE', 'LEAD_UPDATE',
      'LEAD_ACTIVITY_CREATE', 'FOLLOW_UP_MANAGE', 'ATTACHMENT_MANAGE'
  )
ON CONFLICT DO NOTHING;

-- Grant BDM permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code = 'BDM' 
  AND p.code IN (
      'CLIENT_READ', 'CLIENT_CREATE', 'CLIENT_UPDATE', 'CLIENT_DELETE',
      'LEAD_READ', 'LEAD_READ_ALL', 'LEAD_CREATE', 'LEAD_UPDATE', 'LEAD_UPDATE_ALL', 'LEAD_DELETE', 'LEAD_ASSIGN',
      'LEAD_ACTIVITY_CREATE', 'FOLLOW_UP_MANAGE', 'ATTACHMENT_MANAGE'
  )
ON CONFLICT DO NOTHING;
