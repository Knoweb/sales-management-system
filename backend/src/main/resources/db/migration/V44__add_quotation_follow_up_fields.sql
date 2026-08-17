ALTER TABLE follow_ups ADD COLUMN quotation_id UUID;
ALTER TABLE follow_ups ADD COLUMN follow_up_type VARCHAR(50);
ALTER TABLE follow_ups ADD COLUMN result VARCHAR(50);

ALTER TABLE follow_ups ADD CONSTRAINT fk_follow_ups_quotation 
    FOREIGN KEY (quotation_id) REFERENCES quotations (id);
