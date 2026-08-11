-- ==========================================
-- Phase 15: Virtual Tour Tracking
-- ==========================================

CREATE TABLE virtual_tours (
    id UUID PRIMARY KEY,
    lead_id UUID REFERENCES leads(id),
    opportunity_id UUID REFERENCES sales_opportunities(id),
    platform VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    tour_date TIMESTAMP WITH TIME ZONE NOT NULL,
    conducted_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Permissions
INSERT INTO permissions (id, code, name, description) VALUES 
(gen_random_uuid(), 'VIRTUAL_TOUR_READ', 'Read Virtual Tours', 'Can view virtual tours'),
(gen_random_uuid(), 'VIRTUAL_TOUR_CREATE', 'Create Virtual Tour', 'Can create virtual tours'),
(gen_random_uuid(), 'VIRTUAL_TOUR_UPDATE', 'Update Virtual Tour', 'Can update virtual tours'),
(gen_random_uuid(), 'VIRTUAL_TOUR_DELETE', 'Delete Virtual Tour', 'Can delete virtual tours');

-- Assign permissions to System Admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'SYS_ADMIN' AND p.code IN ('VIRTUAL_TOUR_READ', 'VIRTUAL_TOUR_CREATE', 'VIRTUAL_TOUR_UPDATE', 'VIRTUAL_TOUR_DELETE');

-- Assign read/create/update to Sales Manager and Sales Rep
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code IN ('SALES_MANAGER', 'SALES_REP') AND p.code IN ('VIRTUAL_TOUR_READ', 'VIRTUAL_TOUR_CREATE', 'VIRTUAL_TOUR_UPDATE');
