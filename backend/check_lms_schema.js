const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const tables = ['lessons', 'quizzes', 'courses', 'modules'];
    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.log(`Table '${table}' error:`, error.message);
        } else {
            console.log(`Table '${table}' exists. Columns:`, Object.keys(data[0] || {}));
        }
    }
}

check();
