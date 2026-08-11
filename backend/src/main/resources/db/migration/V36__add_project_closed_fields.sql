-- ==========================================
-- Add Closed At/By to Project Execution Workspace
-- ==========================================

ALTER TABLE project_execution_workspaces
ADD COLUMN closed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN closed_by UUID REFERENCES users(id);
