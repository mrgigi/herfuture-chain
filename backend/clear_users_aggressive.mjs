import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function wipeAllUsers() {
    console.log("---- STARTING COMPLETE DATA WIPE ----");
    try {
        // 1. Delete from auth.users
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
        if (authError) throw authError;
        let authCount = 0;
        for (const u of users) {
            await supabase.auth.admin.deleteUser(u.id);
            authCount++;
        }
        console.log(`✅ Deleted ${authCount} users from Auth.`);

        // 2. Fetch all participants to cascade delete
        const { data: participants } = await supabase.from('participants').select('id, auth_id');
        if (participants && participants.length > 0) {
            const pIds = participants.map(p => p.id);
            const authIds = participants.filter(p => p.auth_id).map(p => p.auth_id);

            console.log(`Found ${pIds.length} orphaned participants. Wiping their related data...`);

            // Safely wipe related tables ignoring "table does not exist" errors
            const tablesToClear = ['lesson_completions', 'participant_progress', 'quizzes', 'credentials', 'grants', 'wallets', 'courses', 'modules', 'lessons'];

            for (const table of tablesToClear) {
                const { error } = await supabase.from(table).delete().neq('id', 'this-will-match-all');
                if (error && !error.message.includes('find')) {
                    console.log(`  - Warning on ${table}: ${error.message}`);
                } else {
                    console.log(`  - Emptied table: ${table}`);
                }
            }

            // Delete the participants
            const { error: pDelError } = await supabase.from('participants').delete().in('id', pIds);
            if (pDelError) {
                console.error(`❌ Failed to delete from participants: ${pDelError.message}`);
            } else {
                console.log(`✅ Deleted ${pIds.length} records from participants table.`);
            }

        } else {
            console.log("✅ No participant records found. Database is clean.");

            // Also wipe courses and track data just in case
            const tablesToClear = ['lesson_completions', 'participant_progress', 'quizzes', 'grants', 'credentials', 'modules', 'lessons', 'courses', 'wallets'];
            for (const table of tablesToClear) {
                await supabase.from(table).delete().neq('id', 'this-will-match-all');
            }
            console.log("✅ Wiped all public tables (courses, modules, lessons, etc).");
        }

        console.log("---- WIPE COMPLETE ----");
    } catch (error) {
        console.error("❌ Fatal Error:", error);
    }
}

wipeAllUsers();
