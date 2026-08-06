-- Phase 9: Quotation Management Schema

CREATE TABLE quotations (
    id UUID PRIMARY KEY,
    quotation_number VARCHAR(255) NOT NULL UNIQUE,
    version INTEGER NOT NULL DEFAULT 0,
    approved_estimate_id UUID,
    
    -- Client/Project Summary
    client_details TEXT,
    project_title VARCHAR(255),
    project_description TEXT,
    scope_of_work TEXT,
    
    -- Financials
    subtotal DECIMAL(19, 2),
    tax_amount DECIMAL(19, 2),
    discount_amount DECIMAL(19, 2),
    final_total DECIMAL(19, 2),
    
    -- Terms
    payment_terms TEXT,
    delivery_period VARCHAR(255),
    warranty_information TEXT,
    validity_period VARCHAR(255),
    terms_and_conditions TEXT,
    
    status VARCHAR(50) NOT NULL,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE quotation_items (
    id UUID PRIMARY KEY,
    quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    description TEXT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(19, 2) NOT NULL,
    line_total DECIMAL(19, 2) NOT NULL
);

-- Insert new permissions
INSERT INTO permissions (id, code, name, description) VALUES
    ('10000000-0000-0000-0000-000000000100', 'QUOTATION_CREATE', 'Create Quotations', 'Create a new quotation'),
    ('10000000-0000-0000-0000-000000000101', 'QUOTATION_READ', 'Read Quotations', 'Read quotations'),
    ('10000000-0000-0000-0000-000000000102', 'QUOTATION_UPDATE', 'Update Quotations', 'Update a quotation'),
    ('10000000-0000-0000-0000-000000000103', 'QUOTATION_DELETE', 'Delete Quotations', 'Delete a quotation')
ON CONFLICT (code) DO NOTHING;

-- Assign permissions to relevant roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code IN ('TECHNICAL_COORDINATOR', 'SYSTEM_ADMIN', 'GENERAL_MANAGER')
  AND p.code IN ('QUOTATION_CREATE', 'QUOTATION_READ', 'QUOTATION_UPDATE', 'QUOTATION_DELETE')
ON CONFLICT DO NOTHING;
