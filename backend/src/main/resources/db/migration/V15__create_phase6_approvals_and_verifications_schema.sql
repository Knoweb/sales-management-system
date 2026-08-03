-- V15__create_phase6_approvals_and_verifications_schema.sql

-- 1. BDM Approvals
CREATE TABLE bdm_approvals (
    id UUID PRIMARY KEY,
    opportunity_id UUID NOT NULL,
    project_brief_id UUID NOT NULL,
    project_brief_version_number INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    decision_maker_id UUID,
    decision_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (opportunity_id) REFERENCES sales_opportunities(id),
    FOREIGN KEY (project_brief_id) REFERENCES project_briefs(id),
    FOREIGN KEY (decision_maker_id) REFERENCES users(id)
);

CREATE UNIQUE INDEX uk_active_bdm_approval 
ON bdm_approvals (project_brief_id, project_brief_version_number) 
WHERE status = 'PENDING';

-- 2. BDM Approval Comments
CREATE TABLE bdm_approval_comments (
    id UUID PRIMARY KEY,
    bdm_approval_id UUID NOT NULL,
    comment TEXT NOT NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bdm_approval_id) REFERENCES bdm_approvals(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 3. Client Verifications
CREATE TABLE client_verifications (
    id UUID PRIMARY KEY,
    opportunity_id UUID NOT NULL,
    project_brief_id UUID NOT NULL,
    project_brief_version_number INTEGER NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    verifier_name VARCHAR(255),
    verifier_email VARCHAR(255),
    client_comments TEXT,
    requested_changes TEXT,
    digital_confirmation BOOLEAN NOT NULL DEFAULT false,
    expires_at TIMESTAMPTZ NOT NULL,
    decision_date TIMESTAMPTZ,
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (opportunity_id) REFERENCES sales_opportunities(id),
    FOREIGN KEY (project_brief_id) REFERENCES project_briefs(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE UNIQUE INDEX uk_active_client_verification 
ON client_verifications (project_brief_id, project_brief_version_number) 
WHERE status = 'PENDING';

-- 4. Workflow History
CREATE TABLE workflow_history (
    id UUID PRIMARY KEY,
    opportunity_id UUID NOT NULL,
    project_brief_id UUID NOT NULL,
    project_brief_version_number INTEGER NOT NULL,
    actor_id UUID,
    actor_name VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    previous_state VARCHAR(50),
    new_state VARCHAR(50),
    comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (opportunity_id) REFERENCES sales_opportunities(id),
    FOREIGN KEY (project_brief_id) REFERENCES project_briefs(id),
    FOREIGN KEY (actor_id) REFERENCES users(id)
);

-- 5. Permissions
INSERT INTO permissions (id, code, name, description) VALUES 
('10000000-0000-0000-0000-000000000070', 'BDM_APPROVAL_READ', 'Read BDM Approvals', 'Allows reading BDM approval queue and details'),
('10000000-0000-0000-0000-000000000071', 'BDM_APPROVAL_DECIDE', 'Decide BDM Approvals', 'Allows making decisions on BDM approvals'),
('10000000-0000-0000-0000-000000000072', 'CLIENT_VERIFICATION_CREATE', 'Create Client Verification', 'Allows creating a secure client verification link'),
('10000000-0000-0000-0000-000000000073', 'CLIENT_VERIFICATION_READ', 'Read Client Verification', 'Allows viewing client verification status and details'),
('10000000-0000-0000-0000-000000000074', 'APPROVAL_HISTORY_READ', 'Read Approval History', 'Allows reading the full workflow and approval history')
ON CONFLICT (code) DO NOTHING;

-- Map SYSTEM_ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code = 'SYSTEM_ADMIN' 
  AND p.code IN (
    'BDM_APPROVAL_READ', 'BDM_APPROVAL_DECIDE', 'CLIENT_VERIFICATION_CREATE', 'CLIENT_VERIFICATION_READ', 'APPROVAL_HISTORY_READ'
  )
ON CONFLICT DO NOTHING;

-- Map BDM
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code = 'BDM' 
  AND p.code IN (
    'BDM_APPROVAL_READ', 'BDM_APPROVAL_DECIDE', 'APPROVAL_HISTORY_READ', 'CLIENT_VERIFICATION_READ'
  )
ON CONFLICT DO NOTHING;

-- Map SALES_OFFICER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code = 'SALES_OFFICER' 
  AND p.code IN (
    'CLIENT_VERIFICATION_CREATE', 'CLIENT_VERIFICATION_READ', 'APPROVAL_HISTORY_READ'
  )
ON CONFLICT DO NOTHING;

-- Map TOP_MANAGEMENT
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.code = 'TOP_MANAGEMENT' 
  AND p.code IN (
    'BDM_APPROVAL_READ', 'CLIENT_VERIFICATION_READ', 'APPROVAL_HISTORY_READ'
  )
ON CONFLICT DO NOTHING;
