-- Add first_name and last_name, and remove the combined name field
ALTER TABLE participants 
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT;

-- Move existing data if any (optional but good practice)
-- UPDATE participants SET first_name = split_part(name, ' ', 1), last_name = split_part(name, ' ', 2);

ALTER TABLE participants DROP COLUMN name;
