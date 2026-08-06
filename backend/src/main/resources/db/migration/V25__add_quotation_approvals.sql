-- Phase 9: Top Management Quotation Approvals

CREATE TABLE quotation_approval_history (
    id UUID PRIMARY KEY,
    quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    comments TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL
);

-- Insert new permission for Top Management Approval
INSERT INTO permissions (id, code, name, description) VALUES
    ('10000000-0000-0000-0000-000000000104', 'QUOTATION_APPROVE', 'Approve Quotations', 'Approve or reject quotations by Top Management')
ON CONFLICT (code) DO NOTHING;

-- Assign permission to TOP_MANAGEMENT and SYSTEM_ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code IN ('TOP_MANAGEMENT', 'SYSTEM_ADMIN')
  AND p.code = 'QUOTATION_APPROVE'
ON CONFLICT DO NOTHING;
