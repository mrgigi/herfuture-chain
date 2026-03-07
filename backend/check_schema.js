const supabase = require('./src/services/supabaseService');
require('dotenv').config();

async function checkSchema() {
    // We can't easily check schema via client, but we can try to get one record and see its keys.
    const { data, error } = await supabase
        .from('participants')
        .select('*')
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows'
        console.error("Error:", error);
        return;
    }

    if (data) {
        console.log("Table 'participants' columns:", Object.keys(data));
    } else {
        console.log("Table is empty, trying to fetch from remote schema info if possible (unlikely via REST)");
    }
}

checkSchema();
