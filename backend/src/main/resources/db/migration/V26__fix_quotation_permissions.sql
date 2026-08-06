-- Fix Quotation permissions for Sales Officer and Top Management

-- Assign full Quotation permissions to SALES_OFFICER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code = 'SALES_OFFICER'
  AND p.code IN ('QUOTATION_CREATE', 'QUOTATION_READ', 'QUOTATION_UPDATE', 'QUOTATION_DELETE')
ON CONFLICT DO NOTHING;

-- Assign Quotation Read permission to TOP_MANAGEMENT
-- (They already have QUOTATION_APPROVE, but they need READ to see the list)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code = 'TOP_MANAGEMENT'
  AND p.code = 'QUOTATION_READ'
ON CONFLICT DO NOTHING;
