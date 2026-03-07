import express from 'express';
import cors from 'cors';
import { supabase } from './lib/supabaseService.js';
import { grantDisbursementContract, adminWallet } from './lib/blockchainService.js';
import { ethers } from 'ethers';

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. Participant Routes ---

app.post('/api/create-wallet', async (req, res) => {
    try {
        const { first_name, last_name, phone } = req.body;
        console.log(`[Vercel API] Creating wallet for ${first_name} ${last_name}...`);

        const wallet = ethers.Wallet.createRandom();
        const did = `did:herfuture:${wallet.address}`;

        const { data, error } = await supabase
            .from('participants')
            .insert([{
                first_name,
                last_name,
                phone,
                wallet_address: wallet.address,
                private_key: wallet.privateKey,
                did: did
            }])
            .select()
            .single();

        if (error) throw error;

        // On-chain registration
        try {
            console.log(`[Vercel API] Registering ${wallet.address} on-chain...`);
            const tx = await grantDisbursementContract.registerParticipant(wallet.address);
            await tx.wait();
        } catch (chainErr) {
            console.error("[Vercel API] Chain Registration Error:", chainErr.message);
        }

        res.status(201).json({
            message: "Decentralized identity created successfully",
            participant: data
        });
    } catch (err) {
        console.error("[Vercel API] Signup Error:", err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/participant/:phone', async (req, res) => {
    const { phone } = req.params;
    const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('phone', phone)
        .single();

    if (error || !data) return res.status(404).json({ error: "Participant not found" });
    res.json(data);
});

// --- 2. LMS Routes ---

app.get('/api/courses', async (req, res) => {
    const { data, error } = await supabase.from('courses').select('*').order('track_number', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.get('/api/courses/:courseId/modules', async (req, res) => {
    const { courseId } = req.params;
    const { participantId } = req.query;

    const { data: modules, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('sequence_number', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    if (!participantId) {
        return res.json(modules.map(m => ({ ...m, locked: m.sequence_number > 1 })));
    }

    const { data: progress } = await supabase
        .from('student_progress')
        .select('lesson_id')
        .eq('participant_id', participantId)
        .eq('status', 'completed');

    const completedIds = new Set(progress?.map(p => p.lesson_id) || []);

    const resModules = modules.map(m => ({
        ...m,
        locked: m.sequence_number > 1 && !completedIds.has(modules.find(pm => pm.sequence_number === m.sequence_number - 1)?.id),
        completed: completedIds.has(m.id)
    }));

    res.json(resModules);
});

app.post('/api/complete-lesson', async (req, res) => {
    const { participantId, lessonId, score } = req.body;
    try {
        const { error } = await supabase
            .from('student_progress')
            .upsert({ participant_id: participantId, lesson_id: lessonId, status: 'completed', score: score });

        if (error) throw error;

        const { data: lesson } = await supabase.from('lessons').select('*').eq('id', lessonId).single();

        if (lesson && lesson.grant_amount > 0) {
            const { data: p } = await supabase.from('participants').select('wallet_address').eq('id', participantId).single();
            if (p?.wallet_address) {
                const milestone = lesson.track_label || `M_${lesson.id}`;
                const tx1 = await grantDisbursementContract.completeMilestone(p.wallet_address, milestone);
                await tx1.wait();
                const tx2 = await grantDisbursementContract.releaseGrant(p.wallet_address);
                const rec = await tx2.wait();

                await supabase.from('grants').insert([{ participant_id: participantId, milestone, tx_hash: rec.hash }]);
            }
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 3. Admin & Analytics ---

app.get('/api/admin/participants', async (req, res) => {
    const { data: parts, error } = await supabase.from('participants').select('*, student_progress(*)');
    if (error) return res.status(500).json({ error: error.message });

    const { count: totalL } = await supabase.from('lessons').select('*', { count: 'exact', head: true });

    const formatted = parts.map(p => {
        const comp = p.student_progress?.filter(s => s.status === 'completed').length || 0;
        return { ...p, percentage: totalL ? Math.round((comp / totalL) * 100) : 0 };
    });
    res.json({ participants: formatted });
});

app.get('/api/admin/settings', async (req, res) => {
    const { data, error } = await supabase.from('system_settings').select('*');
    if (error) return res.status(500).json({ error: error.message });
    const s = {};
    data.forEach(i => s[i.key] = i.value);
    res.json(s);
});

app.post('/api/admin/settings', async (req, res) => {
    const { key, value } = req.body;
    await supabase.from('system_settings').upsert({ key, value, updated_at: new Date() });
    res.json({ success: true });
});

app.get('/api/impact/recent-grants', async (req, res) => {
    const { data, error } = await supabase
        .from('grants')
        .select('*, participants(first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) return res.status(500).json({ error: error.message });

    const { data: lessons } = await supabase.from('lessons').select('track_label, title, grant_amount');

    const formatted = data.map(g => {
        const l = lessons.find(lx => lx.track_label === g.milestone);
        return {
            student: g.participants ? `${g.participants.first_name} ${g.participants.last_name}` : 'Anonymous',
            amount: l ? l.grant_amount : 30,
            track: l ? l.title : g.milestone,
            tx: g.tx_hash,
            time: g.created_at
        };
    });
    res.json({ grants: formatted });
});

// Helper for Vercel: fallback for local testing without /api prefix if needed
app.get('/', (req, res) => res.send("HerFuture Chain API Node Live"));

export default app;
