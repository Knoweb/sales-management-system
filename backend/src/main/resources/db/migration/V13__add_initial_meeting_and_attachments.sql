-- V13__add_initial_meeting_and_attachments.sql

-- Create project_brief_attachments table
CREATE TABLE project_brief_attachments (
    id UUID PRIMARY KEY,
    project_brief_id UUID NOT NULL REFERENCES project_briefs(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_url TEXT NOT NULL,
    file_size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_project_brief_attachments_brief_id ON project_brief_attachments(project_brief_id);
