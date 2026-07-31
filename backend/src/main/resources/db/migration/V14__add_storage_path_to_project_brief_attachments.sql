-- V14__add_storage_path_to_project_brief_attachments.sql

ALTER TABLE project_brief_attachments ADD COLUMN storage_path VARCHAR(255);
