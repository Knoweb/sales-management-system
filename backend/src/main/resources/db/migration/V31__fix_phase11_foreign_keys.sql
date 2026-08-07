-- Fix Phase 11 tables to reference employees instead of users

ALTER TABLE project_execution_workspaces DROP CONSTRAINT project_execution_workspaces_project_manager_id_fkey;
ALTER TABLE project_execution_workspaces ADD CONSTRAINT project_execution_workspaces_project_manager_id_fkey FOREIGN KEY (project_manager_id) REFERENCES employees(id);

ALTER TABLE project_employee_allocations DROP CONSTRAINT project_employee_allocations_employee_id_fkey;
ALTER TABLE project_employee_allocations ADD CONSTRAINT project_employee_allocations_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id);

ALTER TABLE project_tasks DROP CONSTRAINT project_tasks_assignee_id_fkey;
ALTER TABLE project_tasks ADD CONSTRAINT project_tasks_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES employees(id);

ALTER TABLE daily_progress_updates DROP CONSTRAINT daily_progress_updates_employee_id_fkey;
ALTER TABLE daily_progress_updates ADD CONSTRAINT daily_progress_updates_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id);

ALTER TABLE project_labour_entries DROP CONSTRAINT project_labour_entries_employee_id_fkey;
ALTER TABLE project_labour_entries ADD CONSTRAINT project_labour_entries_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id);
