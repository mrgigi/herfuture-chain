-- Change email to phone in participants table
ALTER TABLE participants RENAME COLUMN email TO phone;
-- Add a unique constraint if needed (though it was unique as email)
-- In case we want to support both or just phone:
-- For UNICEF, we want phone to be the primary ID.
