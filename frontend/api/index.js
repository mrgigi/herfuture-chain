import express from 'express';
import cors from 'cors';
import { supabase } from './lib/supabaseService.js';
import { grantDisbursementContract, credentialRegistryContract } from './lib/blockchainService.js';
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
            // Check if grant disbursement is active
            const { data: sData } = await supabase.from('system_settings').select('value').eq('key', 'grant_disbursement_active').single();
            const isActive = sData ? sData.value : true;

            if (isActive) {
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
        }
        res.json({ success: true });
    } catch (err) {
        console.error("[Vercel API] Error:", err.message);
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

app.post('/api/admin/modules/:moduleId', async (req, res) => {
    try {
        const { error } = await supabase.from('modules').update(req.body).eq('id', req.params.moduleId);
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

app.post('/api/admin/lessons/:lessonId', async (req, res) => {
    try {
        const { error } = await supabase.from('lessons').update(req.body).eq('id', req.params.lessonId);
        if (error) throw error;
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

app.get('/api/progress-overview/:participantId', async (req, res) => {
    try {
        const { participantId } = req.params;

        // 1. Fetch student progress
        const { data: progress, error: pErr } = await supabase
            .from('student_progress')
            .select('lesson_id, status')
            .eq('participant_id', participantId)
            .eq('status', 'completed');

        if (pErr) throw pErr;

        // 2. Fetch all lessons and their grant amounts
        const { data: lessons, error: lErr } = await supabase
            .from('lessons')
            .select('id, grant_amount, track_label, module_id, course_id, sequence_number')
            .order('sequence_number', { ascending: true });

        if (lErr) throw lErr;

        // 3. Fetch all courses for track info
        const { data: courses } = await supabase.from('courses').select('id, title, track_number');

        const completedLessonIds = new Set(progress?.map(p => p.lesson_id) || []);

        // Calculate Total Earned
        const totalEarned = lessons
            .filter(l => completedLessonIds.has(l.id))
            .reduce((acc, l) => acc + (l.grant_amount || 0), 0);

        // Find Upcoming Reward
        // Sort lessons by track_number then sequence_number to find the "next" one
        const sortedLessons = lessons.map(l => {
            const course = courses?.find(c => c.id === l.course_id);
            return { ...l, track_number: course?.track_number || 999 };
        }).sort((a, b) => {
            if (a.track_number !== b.track_number) return a.track_number - b.track_number;
            return a.sequence_number - b.sequence_number;
        });

        const nextLesson = sortedLessons.find(l => !completedLessonIds.has(l.id));
        const upcomingReward = nextLesson ? (nextLesson.grant_amount || 0) : 0;

        // Calculate progress per course
        const perCourseProgress = courses?.map(course => {
            const courseLessons = lessons.filter(l => l.course_id === course.id);
            const courseCompleted = courseLessons.filter(l => completedLessonIds.has(l.id));
            return {
                courseId: course.id,
                title: course.title,
                completed: courseCompleted.length,
                total: courseLessons.length,
                percentage: courseLessons.length ? Math.round((courseCompleted.length / courseLessons.length) * 100) : 0
            };
        }) || [];

        res.json({
            completedCount: progress?.length || 0,
            totalModules: lessons?.length || 0,
            percentage: lessons?.length ? Math.round((progress?.length / lessons.length) * 100) : 0,
            totalEarned,
            upcomingReward,
            perCourseProgress
        });
    } catch (err) {
        console.error("[Vercel API] progress-overview error:", err);
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
    try {
        const { lessonId, title, learning_outcome, content } = req.body;
        if (!title && !learning_outcome && !content) {
            return res.status(400).json({ error: 'Missing data for quiz generation' });
        }

        console.log(`[Vercel API] Generating AI Quiz for: ${title || 'N/A'}`);

        const prompt = `You are an instructional designer. Create a short 5-question multiple-choice quiz (4 options each) for the following lesson.\n\nLesson Title: ${title || 'N/A'}\nLearning Outcome: ${learning_outcome || 'N/A'}\nLesson Content (summary): ${content || 'N/A'}\n\nReturn the result as a JSON array with objects: { "question": string, "options": [string, string, string, string], "answer": string }`;

        const openaiKey = process.env.OPENAI_API_KEY;
        if (!openaiKey) {
            console.error("[Vercel API] OPENAI_API_KEY not found in environment.");
            return res.status(500).json({ error: 'OpenAI API key not configured' });
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${openaiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('[Vercel API] OpenAI error:', err);
            return res.status(502).json({ error: 'Failed to generate quiz from OpenAI' });
        }

        const data = await response.json();
        const raw = data.choices?.[0]?.message?.content?.trim();

        let quiz;
        try {
            // Basic cleanup for MD code blocks if AI returns them
            const cleaned = raw.replace(/```json|```/g, '').trim();
            quiz = JSON.parse(cleaned);
        } catch (e) {
            const jsonMatch = raw.match(/\[.*\]/s);
            if (jsonMatch) {
                quiz = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Unable to parse quiz JSON');
            }
        }

        // Persist quiz if lessonId provided
        if (lessonId && Array.isArray(quiz)) {
            console.log(`[Vercel API] Storing ${quiz.length} questions for lesson ${lessonId}...`);

            // Cleanup existing first to avoid duplicates
            await supabase.from('quizzes').delete().eq('lesson_id', lessonId);

            const rowsRows = quiz.map(q => ({
                lesson_id: lessonId,
                question: q.question,
                options: q.options,
                correct_answer: q.answer || q.correct_answer
            }));

            const { error: insertErr } = await supabase.from('quizzes').insert(rowsRows);
            if (insertErr) {
                console.error('[Vercel API] Failed to store generated quiz:', insertErr);
            }
        }

        res.json({ quiz });
    } catch (err) {
        console.error('[Vercel API] Quiz generation error:', err);
        res.status(500).json({ error: err.message });
    }
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

app.get('/api/credentials/:address', async (req, res) => {
    try {
        const { address } = req.params;
        if (!address) return res.status(400).json({ error: "Missing address" });

        console.log(`[Vercel API] Fetching credentials for ${address}...`);

        // 1. Fetch from Blockchain (Try-Catch as it might fail in dev without proper RPC/Provider)
        let credentials = [];
        try {
            const raw = await credentialRegistryContract.getCredentials(address);
            credentials = raw.map(cred => ({
                id: cred.credentialId.toString(),
                credentialType: cred.credentialType,
                ipfsHash: cred.ipfsHash,
                timestamp: new Date(Number(cred.timestamp) * 1000).toISOString()
            }));
        } catch (chainErr) {
            console.warn("[Vercel API] Blockchain Credentials fetch failed:", chainErr.message);
        }

        // 2. Fallback to Supabase for demo/mock credentials
        const { data: dbCerts } = await supabase
            .from('credentials')
            .select('*')
            .eq('recipient_address', address);

        if (dbCerts && dbCerts.length > 0) {
            const mappedDbCerts = dbCerts.map(c => ({
                id: c.id.toString(),
                credentialType: c.credential_type,
                ipfsHash: c.ipfs_hash,
                timestamp: c.timestamp,
                isDemo: true
            }));
            const existingHashes = new Set(credentials.map(cr => cr.ipfsHash));
            mappedDbCerts.forEach(mc => {
                if (!existingHashes.has(mc.ipfsHash)) credentials.push(mc);
            });
        }

        res.json(credentials);
    } catch (err) {
        console.error("[Vercel API] Credentials Error:", err);
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
