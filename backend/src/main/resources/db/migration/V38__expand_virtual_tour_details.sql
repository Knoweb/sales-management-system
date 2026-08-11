-- Add missing fields to Virtual Tours table to track effectiveness and feedback

ALTER TABLE virtual_tours
ADD COLUMN language VARCHAR(50),
ADD COLUMN demonstrated_product VARCHAR(255),
ADD COLUMN client_response TEXT,
ADD COLUMN probability_before INTEGER,
ADD COLUMN probability_after INTEGER,
ADD COLUMN follow_up_required BOOLEAN DEFAULT false;
