ALTER TABLE leads ADD COLUMN contact_id UUID REFERENCES client_contacts(id);
