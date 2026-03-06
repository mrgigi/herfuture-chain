-- Create Participants table
CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    wallet_address TEXT,
    did TEXT,
    course_progress INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Credentials table
CREATE TABLE credentials (
    credential_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    skill TEXT NOT NULL,
    ipfs_hash TEXT NOT NULL,
    tx_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Grants table
CREATE TABLE grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    milestone TEXT NOT NULL,
    withdrawable_amount NUMERIC DEFAULT 0,
    savings_amount NUMERIC DEFAULT 0,
    investment_amount NUMERIC DEFAULT 0,
    tx_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
