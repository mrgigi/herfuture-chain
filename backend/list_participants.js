const supabase = require('./src/services/supabaseService');
require('dotenv').config();

async function listParticipants() {
    const { data, error } = await supabase
        .from('participants')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error fetching participants:", error);
        return;
    }

    console.log("Recent Participants:");
    data.forEach(p => {
        console.log(`- ${p.first_name} ${p.last_name} (${p.phone}) | DID: ${p.did} | Created: ${p.created_at}`);
    });
}

listParticipants();
