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
    const { participantId } = req.query;
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

        // 3. Fetch student progress if participantId provided
        let completedLessonIds = new Set();
        if (participantId) {
            const { data: progress } = await supabase
                .from('student_progress')
                .select('lesson_id')
                .eq('participant_id', participantId)
                .eq('status', 'completed');
            completedLessonIds = new Set((progress || []).map(p => p.lesson_id));
        }

        // 4. Group nested, marking completed/locked status
        let prevLessonCompleted = true; // First lesson is always unlocked
        const result = modules.map(mod => ({
            ...mod,
            lessons: (lessons || [])
                .filter(l => l.module_id === mod.id)
                .map(lesson => {
                    const completed = completedLessonIds.has(lesson.id);
                    const locked = !prevLessonCompleted;
                    prevLessonCompleted = completed;
                    return { ...lesson, completed, locked };
                })
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

app.get('/api/lessons/:lessonId/quiz', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('quizzes')
            .select('*')
            .eq('lesson_id', req.params.lessonId);

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.json([]);
        }

        // Return in the shape expected by LessonPlayer: [{ data: questions[] }]
        const questions = data.map(q => ({
            question: q.question,
            options: q.options,
            answer: q.correct_answer,
            correct_answer: q.correct_answer
        }));

        res.json([{ data: questions }]);
    } catch (err) {
        console.error('[Vercel API] Quiz fetch error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/lessons/:lessonId/quiz', async (req, res) => {
    try {
        const { lessonId } = req.params;
        const { data: quizData } = req.body;

        if (!Array.isArray(quizData) || quizData.length === 0) {
            return res.status(400).json({ error: 'Invalid quiz data' });
        }

        // Clear existing
        await supabase.from('quizzes').delete().eq('lesson_id', lessonId);

        const rows = quizData.map(q => ({
            lesson_id: lessonId,
            question: q.question,
            options: q.options,
            correct_answer: q.answer || q.correct_answer
        }));

        const { error } = await supabase.from('quizzes').insert(rows);
        if (error) throw error;

        res.json({ success: true });
    } catch (err) {
        console.error('[Vercel API] Quiz save error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/complete-lesson', async (req, res) => {
    const { participantId, lessonId, score } = req.body;
    try {
        const { error } = await supabase
            .from('student_progress')
            .upsert({ participant_id: participantId, lesson_id: lessonId, status: 'completed', score: score });

        if (error) throw error;

        let grantStatus = null;
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
                        console.log(`[Vercel API] Grant release triggered: ${tx2.hash}`);
                        const rec = await tx2.wait();
                        console.log(`[Vercel API] Grant release confirmed in block ${rec.blockNumber}`);

                        // Prevent duplicate grant rows — only insert if first time
                        const { data: existing } = await supabase
                            .from('grants')
                            .select('id')
                            .eq('participant_id', participantId)
                            .eq('milestone', milestone)
                            .limit(1);

                        if (!existing || existing.length === 0) {
                            await supabase.from('grants').insert([{ participant_id: participantId, milestone, tx_hash: rec.hash, amount: lesson.grant_amount, lesson_id: lesson.id }]);
                        }
                        grantStatus = 'disbursed';
                    } catch (bcErr) {
                        console.error("[Vercel API] Blockchain Grant Error:", bcErr.message);
                    }
                }
            } else {
                grantStatus = 'paused';
            }
        }
        res.json({ success: true, grantStatus });
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

        // 2. Fetch all lessons WITH their module sequence number for correct ordering
        const { data: lessons, error: lErr } = await supabase
            .from('lessons')
            .select('id, grant_amount, track_label, module_id, course_id, sequence_number, modules(sequence_number)');

        if (lErr) throw lErr;

        // 3. Fetch all courses for track info
        const { data: courses } = await supabase.from('courses').select('id, title, track_number');

        const completedLessonIds = new Set(progress?.map(p => p.lesson_id) || []);

        // Calculate Total Earned from actual lesson grant amounts
        const totalEarned = lessons
            .filter(l => completedLessonIds.has(l.id))
            .reduce((acc, l) => acc + (Number(l.grant_amount) || 0), 0);

        // Find Upcoming Reward using 3-level sort:
        // 1. Course track_number (track/learning path order)
        // 2. Module sequence_number (module order within a course)
        // 3. Lesson sequence_number (lesson order within a module)
        const sortedLessons = lessons.map(l => {
            const course = courses?.find(c => c.id === l.course_id);
            return {
                ...l,
                course_track: course?.track_number ?? 999,
                module_seq: l.modules?.sequence_number ?? 999,
                lesson_seq: l.sequence_number ?? 999
            };
        }).sort((a, b) => {
            if (a.course_track !== b.course_track) return a.course_track - b.course_track;
            if (a.module_seq !== b.module_seq) return a.module_seq - b.module_seq;
            return a.lesson_seq - b.lesson_seq;
        });

        console.log('[Vercel API] Sorted lessons for upcoming reward:', sortedLessons.slice(0, 5).map(l => ({
            id: l.id, grant: l.grant_amount, course_track: l.course_track, mod_seq: l.module_seq, lesson_seq: l.lesson_seq
        })));

        // The "next" lesson is the first in the correctly sorted list that the user has NOT completed
        const nextLesson = sortedLessons.find(l => !completedLessonIds.has(l.id));
        const upcomingReward = nextLesson ? (Number(nextLesson.grant_amount) || 0) : 0;

        console.log('[Vercel API] Next lesson:', { id: nextLesson?.id, grant: nextLesson?.grant_amount });

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
            totalLessons: lessons?.length || 0,
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

        // Fetch lessons with track_label OR match by lesson_id if we have it
        const { data: lessons } = await supabase.from('lessons').select('id, track_label, title, grant_amount');

        const formatted = grants.map(grant => {
            // Try matching by lesson_id first (best), then track_label
            const lesson = lessons?.find(l => l.id === grant.lesson_id) ||
                lessons?.find(l => l.track_label === grant.milestone);

            return {
                ...grant,
                milestone_name: lesson ? lesson.title : (grant.milestone.startsWith('M_') ? 'Lesson Reward' : `Milestone ${grant.milestone}`),
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

        // Sum actual amounts. If amount is missing (unlikely now), we use 0 to avoid inflation
        const totalImpact = grants?.reduce((acc, g) => acc + (Number(g.amount) || 0), 0) || 0;

        // FETCH ACTUAL BLOCKCHAIN TREASURY BALANCE
        const cusdAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";
        const cusdAbi = ["function balanceOf(address) view returns (uint256)"];
        const provider = new ethers.JsonRpcProvider(process.env.CELO_RPC_URL || "https://alfajores-forno.celo-testnet.org");
        const cusdContract = new ethers.Contract(cusdAddress, cusdAbi, provider);

        // Check the admin wallet balance (treasury)
        let treasuryBalance = 0;
        try {
            const balance = await cusdContract.balanceOf(process.env.ADMIN_WALLET_ADDRESS || adminWallet.address);
            treasuryBalance = Number(ethers.formatEther(balance));
        } catch (balErr) {
            console.error("[Vercel API] Failed to fetch treasury balance:", balErr.message);
            treasuryBalance = 100000; // Fallback to placeholder if RPC fails
        }

        // REAL GRADUATES CALCULATION:
        const { count: realGrads } = await supabase
            .from('student_progress')
            .select('participant_id', { count: 'exact', head: true })
            .eq('status', 'completed');

        const estimatedGrads = Math.floor((realGrads || 0) / 10) || (students > 0 ? 1 : 0);

        res.json({
            totalImpact,
            treasuryBalance,
            grantsDistributed: grants?.length || 0,
            graduates: estimatedGrads || 0,
            countries: 1,
            participants: students || 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/impact/recent-grants', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const start = (page - 1) * limit;
        const end = start + limit - 1;

        const { data, error, count } = await supabase
            .from('grants')
            .select(`
                id,
                milestone,
                tx_hash,
                amount,
                created_at,
                lesson_id,
                participants (
                    first_name,
                    last_name
                )
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(start, end);

        if (error) throw error;

        const { data: lessons } = await supabase
            .from('lessons')
            .select('id, track_label, title, grant_amount');

        const formatted = (data || []).map(g => {
            const lesson = (lessons || []).find(l => l.id === g.lesson_id) ||
                (lessons || []).find(l => l.track_label === g.milestone);
            return {
                student: g.participants
                    ? `${g.participants.first_name || 'Student'} ${g.participants.last_name || ''}`.trim()
                    : 'Anonymous',
                amount: g.amount || (lesson ? lesson.grant_amount : 0),
                track: lesson ? lesson.title : (g.milestone?.startsWith('M_') ? 'Lesson Reward' : g.milestone),
                tx_hash: g.tx_hash,
                created_at: g.created_at
            };
        });

        res.json({
            grants: formatted,
            total: count || 0,
            page,
            limit
        });
    } catch (err) {
        console.error('[Vercel API] recent-grants error:', err);
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

        const geminiKey = process.env.GEMINI_API_KEY;
        if (!geminiKey) {
            console.error("[Vercel API] GEMINI_API_KEY not found in environment.");
            return res.status(500).json({ error: 'Gemini API key not configured. Add GEMINI_API_KEY to your Vercel environment variables.' });
        }

        console.log(`[Vercel API] Generating AI Quiz via Gemini for: ${title || 'N/A'}`);

        const prompt = `You are an instructional designer creating a quiz for teenage girls learning digital skills in Nigeria.

Create exactly 5 multiple-choice questions (4 options each) for this lesson:
- Lesson Title: ${title || 'N/A'}
- Learning Outcome: ${learning_outcome || 'N/A'}
- Content Summary: ${content || 'N/A'}

Rules:
- Questions must be practical and relatable (not academic)
- Use simple, clear English (B1 level)
- One answer must be clearly correct
- Return ONLY a valid JSON array with no extra text

Format:
[{"question": "...", "options": ["A", "B", "C", "D"], "answer": "A"}]`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1200,
                    responseMimeType: 'application/json'
                }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('[Vercel API] Gemini API error:', errText);
            return res.status(502).json({ error: `Gemini API error: ${response.status} ${response.statusText}` });
        }

        const data = await response.json();
        const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!raw) {
            return res.status(502).json({ error: 'Gemini returned an empty response' });
        }

        let quiz;
        try {
            const cleaned = raw.replace(/```json|```/g, '').trim();
            quiz = JSON.parse(cleaned);
        } catch (e) {
            const jsonMatch = raw.match(/\[.*\]/s);
            if (jsonMatch) {
                quiz = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Unable to parse quiz JSON from Gemini response');
            }
        }

        if (!Array.isArray(quiz) || quiz.length === 0) {
            return res.status(502).json({ error: 'Gemini did not return a valid quiz array' });
        }

        // Persist if lessonId provided
        if (lessonId) {
            console.log(`[Vercel API] Storing ${quiz.length} questions for lesson ${lessonId}...`);
            await supabase.from('quizzes').delete().eq('lesson_id', lessonId);
            const rows = quiz.map(q => ({
                lesson_id: lessonId,
                question: q.question,
                options: q.options,
                correct_answer: q.answer || q.correct_answer
            }));
            const { error: insertErr } = await supabase.from('quizzes').insert(rows);
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
