const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data, error } = await supabase.rpc('get_tables');
    if (error) {
        // Fallback: try querying information_schema
        const { data: qData, error: qErr } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public');
        if (qErr) {
            console.error(qErr);
            return;
        }
        console.log("Tables:", qData);
    } else {
        console.log(data);
    }
}
run();
