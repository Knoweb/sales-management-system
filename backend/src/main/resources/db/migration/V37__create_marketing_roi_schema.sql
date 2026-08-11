-- V37__create_marketing_roi_schema.sql

-- 1. Marketing Campaigns
CREATE TABLE marketing_campaigns (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    objective VARCHAR(255),
    marketing_cost NUMERIC(19, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE INDEX idx_mkt_campaign_platform ON marketing_campaigns(platform);
CREATE INDEX idx_mkt_campaign_status ON marketing_campaigns(status);

-- 2. Link Leads to Marketing Campaign
ALTER TABLE leads ADD COLUMN marketing_campaign_id UUID;
ALTER TABLE leads ADD CONSTRAINT fk_leads_marketing_campaign FOREIGN KEY (marketing_campaign_id) REFERENCES marketing_campaigns(id) ON DELETE SET NULL;
CREATE INDEX idx_leads_marketing_campaign ON leads(marketing_campaign_id);

-- 3. Permissions Setup
INSERT INTO permissions (id, code, name, description) VALUES 
('10000000-0000-0000-0000-000000000110', 'MARKETING_ROI_READ', 'Read Marketing ROI', 'Allows viewing marketing campaigns and ROI reports'),
('10000000-0000-0000-0000-000000000111', 'MARKETING_ROI_WRITE', 'Manage Marketing Campaigns', 'Allows creating and editing marketing campaigns')
ON CONFLICT (code) DO NOTHING;

-- Map SYSTEM_ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code = 'SYSTEM_ADMIN' 
  AND p.code IN ('MARKETING_ROI_READ', 'MARKETING_ROI_WRITE')
ON CONFLICT DO NOTHING;

-- Map GENERAL_MANAGER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code = 'GENERAL_MANAGER' 
  AND p.code IN ('MARKETING_ROI_READ', 'MARKETING_ROI_WRITE')
ON CONFLICT DO NOTHING;
