const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data } = await supabase.from('lesson_completions').select('*').limit(1);
    console.log('lesson_completions columns:', Object.keys(data[0] || {}));
    process.exit(0);
}

check();
