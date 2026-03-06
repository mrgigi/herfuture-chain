const supabase = require('./src/services/supabaseService');
require('dotenv').config();

async function addLearningOutcomesColumn() {
    console.log("🛠️ Attempting to add 'learning_outcomes' column to 'lessons'...");

    // We can use a raw SQL query through Supabase if we have RPC enabled or just use the seed script
    // But usually RLS or lack of RPC prevents raw DDL via the client.
    // I will try to use the REST API to see if I can trigger it or just use an alternative.

    // Actually, I'll try to insert a dummy lesson WITHOUT the column first to confirm it's missing.
    // Then I'll suggest the user apply the migration manually if I can't.
    // HOWEVER, I can try to use a more clever way:
    // Some Supabase setups allow running SQL via a specific 'sql' function if configured.

    // Let's see if I can just manually rename the student and seed WITHOUT learning_outcomes first to get things working.
    // Actually, I'll just remove the learning_outcomes from the seed script for now if I can't add the column,
    // to at least restore the modules. 
    // BUT I want to give the user what they asked for.

    // Let's try to run a raw query if possible. 
    const { error } = await supabase.rpc('run_sql', { sql: "ALTER TABLE lessons ADD COLUMN IF NOT EXISTS learning_outcomes TEXT[];" });
    if (error) {
        console.error("RPC 'run_sql' failed. This is expected if the RPC isn't set up.", error);
    } else {
        console.log("Column added successfully!");
    }
}

addLearningOutcomesColumn();
