-- V16__add_encrypted_token_and_permission.sql

ALTER TABLE client_verifications ADD COLUMN encrypted_token VARCHAR(255);

INSERT INTO permissions (id, code, name, description) VALUES 
(gen_random_uuid(), 'CLIENT_VERIFICATION_READ_LINK', 'Read Client Verification Link', 'Allows user to view the active plain token link for a client verification');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p 
WHERE r.code = 'SYSTEM_ADMIN' AND p.code = 'CLIENT_VERIFICATION_READ_LINK';
