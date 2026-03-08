const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'quizzes' });
    if (error) {
        // Fallback: Use direct SQL via a dummy query if RPC is not available
        console.log("RPC failed, trying information_schema via query...");
        const { data: cols, error: err2 } = await supabase
            .from('quizzes')
            .select('*')
            .limit(0); // This should return column names in the response if handled correctly by the client

        if (err2) {
            console.log("Error:", err2.message);
        } else {
            // In some versions, the client metadata might show columns? 
            // Let's try to just insert a dummy and see errors.
            console.log("Try insert dummy...");
            const { error: err3 } = await supabase.from('quizzes').insert([{ dummmy_col: 'test' }]);
            console.log("Insert error (reveals schema):", err3?.message);
        }
    } else {
        console.log("Columns:", data);
    }
}

check();
