const supabase = require('./src/services/supabaseService');
require('dotenv').config();

async function promoteIreoluwa() {
    const phone = '0739039856';
    console.log(`--- Promoting Student: ${phone} (Ireoluwa) ---`);

    // 1. Rename to Ireoluwa
    await supabase.from('participants').update({
        first_name: 'Ireoluwa',
        last_name: 'Giwa',
        bio: 'Aspiring digital leader and teen mother advocate. Mastering frontend development and on-chain finance to build a better future for my community.',
        avatar_url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200&h=200&auto=format&fit=crop'
    }).eq('phone', phone);

    const { data: participant } = await supabase.from('participants').select('*').eq('phone', phone).single();
    if (!participant) return console.log('not found');

    const pId = participant.id;

    // 2. Fetch all lessons
    const { data: rawLessons } = await supabase.from('lessons').select('*').order('sequence_number', { ascending: true });
    console.log(`Found ${rawLessons ? rawLessons.length : 0} lessons.`);

    if (!rawLessons || rawLessons.length === 0) {
        console.warn('NO LESSONS FOUND. SEEDING NEEDED.');
        return;
    }

    // 3. Complete 10 modules
    const lessonsToComplete = rawLessons.slice(0, 10);
    const progressRecords = lessonsToComplete.map(l => ({
        participant_id: pId,
        lesson_id: l.id,
        status: 'completed',
        score: 100
    }));

    await supabase.from('student_progress').delete().eq('participant_id', pId);
    await supabase.from('student_progress').insert(progressRecords);

    // 4. Seed Grants
    await supabase.from('grants').delete().eq('participant_id', pId);
    const grantsToSeed = lessonsToComplete.filter(l => l.grant_amount > 0).slice(0, 4);
    const grantRecords = grantsToSeed.map((l, i) => ({
        participant_id: pId,
        milestone: l.track_label,
        tx_hash: `0x${Math.random().toString(16).slice(2, 66)}`.padEnd(66, '0'),
        created_at: new Date(Date.now() - (i * 86400000)).toISOString()
    }));
    await supabase.from('grants').insert(grantRecords);

    // 5. Seed Credentials
    console.log('Seeding credentials...');
    await supabase.from('credentials').delete().eq('recipient_address', participant.wallet_address);
    const certRecords = [
        {
            recipient_address: participant.wallet_address,
            credential_type: 'Digital Literacy & AI Prep',
            ipfs_hash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
            tx_hash: `0x${Math.random().toString(16).slice(2, 66)}`.padEnd(66, '0'),
            timestamp: new Date(Date.now() - 345600000).toISOString()
        },
        {
            recipient_address: participant.wallet_address,
            credential_type: 'Self-Leadership Foundations',
            ipfs_hash: 'QmSnuW2EVkUhMcBvX877wPLVf5y5bY78W9S0e4pB9qL4nN',
            tx_hash: `0x${Math.random().toString(16).slice(2, 66)}`.padEnd(66, '0'),
            timestamp: new Date(Date.now() - 864000000).toISOString()
        }
    ];
    await supabase.from('credentials').insert(certRecords);

    console.log('--- Ireoluwa Promoted! ---');
}

promoteIreoluwa();
