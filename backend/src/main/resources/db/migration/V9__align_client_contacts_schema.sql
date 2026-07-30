-- Restore potentially missing columns
ALTER TABLE client_contacts ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE client_contacts ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE client_contacts ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE client_contacts ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE client_contacts ADD COLUMN IF NOT EXISTS job_title VARCHAR(100);
ALTER TABLE client_contacts ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;
ALTER TABLE client_contacts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- If V8 changed first_name/last_name into 'name', attempt to split it
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_contacts' AND column_name = 'name') THEN
        UPDATE client_contacts SET first_name = SPLIT_PART(name, ' ', 1) WHERE first_name IS NULL;
        UPDATE client_contacts SET last_name = SUBSTRING(name FROM POSITION(' ' IN name) + 1) WHERE last_name IS NULL AND POSITION(' ' IN name) > 0;
    END IF;
END $$;

-- Safe backfill for NOT NULL constraints
UPDATE client_contacts SET first_name = 'Unknown' WHERE first_name IS NULL;
UPDATE client_contacts SET last_name = 'Unknown' WHERE last_name IS NULL;
UPDATE client_contacts SET is_primary = false WHERE is_primary IS NULL;
UPDATE client_contacts SET is_active = true WHERE is_active IS NULL;

-- Apply NOT NULL constraints
ALTER TABLE client_contacts ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE client_contacts ALTER COLUMN last_name SET NOT NULL;
ALTER TABLE client_contacts ALTER COLUMN is_primary SET NOT NULL;
ALTER TABLE client_contacts ALTER COLUMN is_active SET NOT NULL;

-- Drop the 'name' column if it exists to align with entity
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_contacts' AND column_name = 'name') THEN
        ALTER TABLE client_contacts DROP COLUMN name;
    END IF;
END $$;
