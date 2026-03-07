const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
    console.log("--- Supabase Table List ---");
    const { data, error } = await supabase.from('pg_tables').select('tablename').eq('schemaname', 'public');
    if (error) {
        // If pg_tables is not public (usually isn't), try a common discovery path
        console.warn("Direct pg_tables query restricted. Trying fallback discovery...");
        const tables = ['courses', 'lessons', 'quizzes', 'system_settings', 'participants', 'grants', 'student_progress'];
        for (const t of tables) {
            const { error: te } = await supabase.from(t).select('id').limit(1);
            if (!te) console.log(`✅ Table '${t}' exists.`);
            else console.log(`❌ Table '${t}' missing or error: ${te.message}`);
        }
    } else {
        data.forEach(t => console.log(`✅ ${t.tablename}`));
    }
}

checkSchema();
