ALTER TABLE project_execution_workspaces
ADD COLUMN client_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN client_acceptance_date DATE,
ADD COLUMN client_acceptance_notes TEXT,
ADD COLUMN warranty_start_date DATE,
ADD COLUMN warranty_end_date DATE,
ADD COLUMN warranty_notes TEXT;
