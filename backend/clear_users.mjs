import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Cannot clear users.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function clearAuthUsers() {
    try {
        console.log("Fetching users to delete...");
        const { data: { users }, error } = await supabase.auth.admin.listUsers();

        if (error) throw error;

        console.log(`Found ${users.length} users.`);

        let deletedCount = 0;
        for (const user of users) {
            const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
            if (deleteError) {
                console.error(`Failed to delete user ${user.id}:`, deleteError.message);
            } else {
                deletedCount++;
            }
        }
        console.log(`Successfully deleted ${deletedCount} users from auth.users.`);
    } catch (error) {
        console.error("Error clearing users:", error);
    }
}

clearAuthUsers();
