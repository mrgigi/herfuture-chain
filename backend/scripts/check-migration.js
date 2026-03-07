const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Critical: Supabase credentials missing during migration.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    console.log("🚀 Starting database migration: Syncing schema with AI Quiz update...");

    try {
        // 1. Add learning_outcome and cover_url to courses
        console.log("Checking 'courses' table columns...");

        // We'll use a raw query or try to insert/select to detect. 
        // Since Supabase JS doesn't have an 'alter table' equivalent, 
        // we usually rely on the SQL editor. However, I can try to 
        // invoke the SQL API if available, or just log instructions.
        // BUT wait, I can actually run a raw SQL query if they have 
        // enabled the 'pg_net' or similar, but typically one uses 
        // the dashboard.

        // Better: I'll try to perform a dummy select to verify existence.
        const { data: cols, error: colError } = await supabase.from('courses').select('learning_outcome, cover_url').limit(1);

        if (colError && colError.message.includes('column "learning_outcome" does not exist')) {
            console.error("❌ MIGRATION REQUIRED: Database columns missing.");
            console.log("Please run the following SQL in your Supabase Dashboard SQL Editor:");
            console.log(`
            ALTER TABLE courses 
            ADD COLUMN IF NOT EXISTS learning_outcome TEXT,
            ADD COLUMN IF NOT EXISTS cover_url TEXT;

            ALTER TABLE lessons
            ADD COLUMN IF NOT EXISTS content TEXT;
        `);
        } else {
            console.log("✅ Columns 'learning_outcome' and 'cover_url' already exist.");
        }

    } catch (err) {
        console.error("Migration check failed:", err.message);
    }
}

migrate();
