import dotenv from 'dotenv';
dotenv.config({ path: 'frontend/.env' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
    const { data: lessons } = await supabase.from('lessons').select('id, title, grant_amount').limit(1);
    const lessonId = lessons[0].id;
    const participantId = "037bce4e-1b83-4a11-8fe7-fbaddd1e70ff";
    
    console.log("Testing with Lesson:", lessonId, "grant amount:", lessons[0].grant_amount);
    
    // Simulate fetch
    const fetch = (await import('node-fetch')).default;
    const res = await fetch('http://localhost:3000/api/complete-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, lessonId, score: 100 })
    });
    
    const text = await res.text();
    console.log("API Response:", text);
}
test();
