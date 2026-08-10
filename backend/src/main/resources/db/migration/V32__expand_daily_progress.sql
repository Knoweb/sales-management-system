ALTER TABLE daily_progress_updates
ADD COLUMN support_required BOOLEAN DEFAULT FALSE,
ADD COLUMN support_details TEXT;
