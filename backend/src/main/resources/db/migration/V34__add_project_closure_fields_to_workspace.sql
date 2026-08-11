ALTER TABLE project_execution_workspaces
ADD COLUMN inspection_status VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
ADD COLUMN inspection_date DATE,
ADD COLUMN inspection_notes TEXT,
ADD COLUMN delivery_date DATE,
ADD COLUMN installation_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN delivery_notes TEXT;
