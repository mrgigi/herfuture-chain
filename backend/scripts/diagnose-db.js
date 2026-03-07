const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function diagnose() {
    console.log("--- Supabase Schema Diagnostics ---");

    const tables = ['courses', 'modules', 'lessons', 'quizzes'];

    for (const table of tables) {
        console.log(`\nTable: ${table}`);
        const { data: sample, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.error(`❌ Error querying '${table}':`, error.message);
            if (error.hint) console.log(`Hint: ${error.hint}`);
        } else {
            console.log(`✅ Table reachable. Columns: ${Object.keys(sample[0] || {}).join(', ')}`);
        }
    }

    // Check 'courses' specifically for 'learning_outcome' vs 'category'
    console.log("\nSpecific Column Check: 'courses'");
    const { data: cols, error: colError } = await supabase.from('courses').select('learning_outcome, cover_url, category').limit(1);
    if (colError) {
        console.log("❌ Result for 'learning_outcome, cover_url, category':", colError.message);
    } else {
        console.log("✅ All three column names exist (or no error returned).");
    }

    // Check backend controller logic for createCourse
    // The subagent said createCourse failed with 500.
    // Let's try to insert a test course.
    console.log("\nTrying mock course insertion...");
    const { data: newCourse, error: insertError } = await supabase
        .from('courses')
        .insert([{ title: 'DIAGNOSTIC TRACK', learning_outcome: 'Test', track_number: 99 }])
        .select();

    if (insertError) {
        console.error("❌ Insertion failed:", insertError.message);
    } else {
        console.log("✅ Insertion successful! ID:", newCourse[0].id);
        // Cleanup
        await supabase.from('courses').delete().eq('id', newCourse[0].id);
    }
}

diagnose();
