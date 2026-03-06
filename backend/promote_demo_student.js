const supabase = require('./src/services/supabaseService');
require('dotenv').config();

async function promoteStudent() {
    const phone = '0739039856';
    console.log(`--- Promoting Student: ${phone} ---`);

    // 1. Find the participant
    const { data: participant, error: pError } = await supabase
        .from('participants')
        .select('*')
        .eq('phone', phone)
        .single();

    if (pError || !participant) {
        console.error('Participant not found. Have you registered yet?');
        return;
    }

    const pId = participant.id;

    // 2. Fetch all lessons to simulate completion
    const { data: rawLessons } = await supabase.from('lessons').select('*').order('track_label', { ascending: true });
    const lessons = Array.isArray(rawLessons) ? rawLessons : [];

    // Complete most of Track 1 and some of Track 2
    const lessonsToComplete = lessons.slice(0, 10);
    console.log(`Completing ${lessonsToComplete.length} lessons...`);

    const progressRecords = lessonsToComplete.map(l => ({
        participant_id: pId,
        lesson_id: l.id,
        status: 'completed',
        score: 100
    }));

    // Clear old progress first to avoid conflicts
    await supabase.from('student_progress').delete().eq('participant_id', pId);

    const { error: progError } = await supabase.from('student_progress').insert(progressRecords);
    if (progError) console.error('Error seeding progress:', progError);

    // 3. Seed some Grant History (Simulation of past payouts)
    console.log('Seeding grant history...');
    await supabase.from('grants').delete().eq('participant_id', pId);

    // Pick lessons with grants from the completed ones
    const grantsToSeed = lessonsToComplete.filter(l => l.grant_amount > 0).slice(0, 4);
    const grantRecords = grantsToSeed.map((l, i) => ({
        participant_id: pId,
        milestone: l.track_label,
        tx_hash: `0x${Math.random().toString(16).slice(2, 66)}`.padEnd(66, '0'),
        created_at: new Date(Date.now() - (i * 86400000)).toISOString()
    }));

    await supabase.from('grants').insert(grantRecords);

    // 4. Add Notifications
    console.log('Adding success notifications...');
    // Assuming a notifications table might exist or we handle them in state, 
    // but for the demo we'll inject them into a 'messages' or similar if it exists.
    // If no table exists, I'll create a simple one or prepare the frontend to handle 'demo' notifications.

    // Update Participant Profile
    await supabase.from('participants').update({
        bio: 'Aspiring digital leader and teen mother advocate. Mastering frontend development and on-chain finance to build a better future for my community.',
        avatar_url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200&h=200&auto=format&fit=crop'
    }).eq('id', pId);

    console.log('--- Promotion Complete! ---');
}

promoteStudent();
