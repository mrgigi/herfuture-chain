const { createClient } = require('@supabase/supabase-js');
const { ethers } = require('ethers');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data: progress, error } = await supabase
        .from('student_progress')
        .select(`
            *,
            participants ( wallet_address ),
            lessons ( title, grant_amount )
        `)
        .limit(20);

    if (error) { console.error(error); return; }
    console.log(JSON.stringify(progress, null, 2));
}
run();
