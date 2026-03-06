-- Add control columns to the LMS
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- Add a table for system settings (e.g., Global Grant Kill-Switch)
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO system_settings (key, value) 
VALUES ('grant_disbursement_active', 'true')
ON CONFLICT (key) DO NOTHING;
