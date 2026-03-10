const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data, error } = await supabase
        .from('student_progress')
        .select('*')
        .not('tx_hash', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(5);
        
    if (error) {
        console.error(error);
        return;
    }
    console.log(data);
}
run();
