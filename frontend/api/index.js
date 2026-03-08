import express from 'express';
import cors from 'cors';
import { supabase } from './lib/supabaseService.js';
import { grantDisbursementContract } from './lib/blockchainService.js';
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
    try {
        const { phone } = req.params;
        const { data, error } = await supabase
            .from('participants')
            .select('id, first_name, last_name, phone, wallet_address, did, created_at')
            .eq('phone', phone)
            .order('created_at', { ascending: false })
            .limit(1);

        if (error || !data || data.length === 0) return res.status(404).json({ error: "Participant not found" });
        res.json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 2. LMS & Curriculum Routes ---

app.get('/api/courses', async (req, res) => {
    try {
        const { data: courses, error } = await supabase.from('courses').select('*').order('track_number', { ascending: true });
        if (error) throw error;

        // Fetch student counts (unique participants in student_progress)
        const { data: progress } = await supabase.from('student_progress').select('participant_id, lessons(course_id)');

        const formatted = courses.map(course => {
            const courseStudents = new Set(
                progress?.filter(p => p.lessons?.course_id === course.id).map(p => p.participant_id)
            );
            return { ...course, student_count: courseStudents.size };
        });

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/courses/:courseId/modules', async (req, res) => {
    const { courseId } = req.params;
    try {
        // 1. Fetch modules
        const { data: modules, error: mErr } = await supabase
            .from('modules')
            .select('*')
            .eq('course_id', courseId)
            .order('sequence_number', { ascending: true });

        if (mErr) throw mErr;

        // 2. Fetch lessons
        const { data: lessons, error: lErr } = await supabase
            .from('lessons')
            .select('*')
            .eq('course_id', courseId)
            .order('sequence_number', { ascending: true });

        if (lErr) throw lErr;

        // 3. Group nested
        const result = modules.map(mod => ({
            ...mod,
            lessons: (lessons || []).filter(l => l.module_id === mod.id)
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/lessons/:lessonId', async (req, res) => {
    try {
        const { data, error } = await supabase.from('lessons').select('*').eq('id', req.params.lessonId).single();
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(404).json({ error: "Lesson not found" });
    }
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
                try {
                    const tx1 = await grantDisbursementContract.completeMilestone(p.wallet_address, milestone);
                    await tx1.wait();
                    const tx2 = await grantDisbursementContract.releaseGrant(p.wallet_address);
                    const rec = await tx2.wait();
                    await supabase.from('grants').insert([{ participant_id: participantId, milestone, tx_hash: rec.hash, amount: lesson.grant_amount }]);
                } catch (bcErr) {
                    console.error("[Vercel API] Blockchain Grant Error:", bcErr.message);
                }
            }
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 3. Admin Routes (Missing in old version) ---

app.post('/api/admin/courses', async (req, res) => {
    try {
        const { data, error } = await supabase.from('courses').insert([req.body]).select().single();
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/courses/:courseId', async (req, res) => {
    try {
        const { error } = await supabase.from('courses').update(req.body).eq('id', req.params.courseId);
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/course-status', async (req, res) => {
    try {
        const { courseId, isPublished } = req.body;
        const { error } = await supabase.from('courses').update({ is_published: isPublished }).eq('id', courseId);
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/courses/:courseId', async (req, res) => {
    const { courseId } = req.params;
    try {
        // MANUAL CASCADE
        const { data: modules } = await supabase.from('modules').select('id').eq('course_id', courseId);
        const { data: lessons } = await supabase.from('lessons').select('id').eq('course_id', courseId);
        const lIds = lessons?.map(l => l.id) || [];

        if (lIds.length > 0) {
            await supabase.from('student_progress').delete().in('lesson_id', lIds);
            await supabase.from('lesson_completions').delete().in('lesson_id', lIds);
            await supabase.from('quizzes').delete().in('lesson_id', lIds);
            await supabase.from('lessons').delete().in('id', lIds);
        }
        if (modules?.length > 0) {
            await supabase.from('modules').delete().in('id', modules.map(m => m.id));
        }
        const { error } = await supabase.from('courses').delete().eq('id', courseId);
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/modules', async (req, res) => {
    try {
        const { data, error } = await supabase.from('modules').insert([req.body]).select().single();
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/modules/:moduleId', async (req, res) => {
    try {
        const { moduleId } = req.params;
        const { data: lessons } = await supabase.from('lessons').select('id').eq('module_id', moduleId);
        const lIds = lessons?.map(l => l.id) || [];
        if (lIds.length > 0) {
            await supabase.from('student_progress').delete().in('lesson_id', lIds);
            await supabase.from('lesson_completions').delete().in('lesson_id', lIds);
            await supabase.from('quizzes').delete().in('lesson_id', lIds);
            await supabase.from('lessons').delete().eq('module_id', moduleId);
        }
        await supabase.from('modules').delete().eq('id', moduleId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/lessons', async (req, res) => {
    try {
        const { data, error } = await supabase.from('lessons').insert([req.body]).select().single();
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/lessons/:lessonId', async (req, res) => {
    try {
        const { lessonId } = req.params;
        await supabase.from('student_progress').delete().eq('lesson_id', lessonId);
        await supabase.from('lesson_completions').delete().eq('lesson_id', lessonId);
        await supabase.from('quizzes').delete().eq('lesson_id', lessonId);
        await supabase.from('lessons').delete().eq('id', lessonId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 4. Grants & Impact ---

app.get('/api/grants/:participantId', async (req, res) => {
    try {
        const { participantId } = req.params;
        const { data: grants, error } = await supabase
            .from('grants')
            .select('*')
            .eq('participant_id', participantId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const { data: lessons } = await supabase.from('lessons').select('track_label, title, grant_amount');

        const formatted = grants.map(grant => {
            const lesson = lessons?.find(l => l.track_label === grant.milestone);
            return {
                ...grant,
                milestone_name: lesson ? lesson.title : `Milestone ${grant.milestone}`,
                amount: grant.amount || (lesson ? lesson.grant_amount : 0)
            };
        });

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/impact/stats', async (req, res) => {
    try {
        const { data: grants } = await supabase.from('grants').select('amount');
        const { count: students } = await supabase.from('participants').select('*', { count: 'exact', head: true });
        const totalImpact = grants?.reduce((acc, g) => acc + (g.amount || 30), 0) || 0;
        res.json({
            totalImpact,
            grantsDistributed: grants?.length || 0,
            graduates: Math.floor((students || 0) * 0.8),
            countries: 1,
            participants: students || 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/curriculum/reorder', async (req, res) => {
    try {
        const { type, items } = req.body;
        const table = type === 'module' ? 'modules' : 'lessons';
        const promises = items.map(item => {
            const updateData = { sequence_number: item.sequence_number };
            if (item.module_id) updateData.module_id = item.module_id;
            return supabase.from(table).update(updateData).eq('id', item.id);
        });
        await Promise.all(promises);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/ai/generate-quiz', async (req, res) => {
    // Placeholder - port OpenAI logic if needed, but for now just return empty
    res.json({ questions: [] });
});

app.get('/api/admin/settings', async (req, res) => {
    try {
        const { data, error } = await supabase.from('system_settings').select('*');
        if (error) throw error;
        const s = {};
        data.forEach(i => s[i.key] = i.value);
        res.json(s);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/settings', async (req, res) => {
    const { key, value } = req.body;
    await supabase.from('system_settings').upsert({ key, value, updated_at: new Date() });
    res.json({ success: true });
});

app.get('/api/admin/participants', async (req, res) => {
    try {
        const { data: parts, error } = await supabase
            .from('participants')
            .select('id, first_name, last_name, phone, wallet_address, did, created_at, student_progress(status)');

        if (error) throw error;
        const { count: totalL } = await supabase.from('lessons').select('*', { count: 'exact', head: true });
        const formatted = parts.map(p => {
            const comp = p.student_progress?.filter(s => s.status === 'completed').length || 0;
            return {
                ...p,
                percentage: totalL ? Math.round((comp / totalL) * 100) : 0
            };
        });
        res.json({ participants: formatted });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/participants/:participantId', async (req, res) => {
    try {
        await supabase.from('student_progress').delete().eq('participant_id', req.params.participantId);
        await supabase.from('grants').delete().eq('participant_id', req.params.participantId);
        const { error } = await supabase.from('participants').delete().eq('id', req.params.participantId);
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => res.send("HerFuture Chain Unified API Live"));

export default app;
