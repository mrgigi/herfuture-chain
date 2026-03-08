const supabase = require('../services/supabaseService');
const { grantDisbursementContract } = require('../services/blockchainService');

async function getCourses(req, res) {
    try {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .order('track_number', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getCourseModules(req, res) {
    try {
        const { courseId } = req.params;
        const { participantId } = req.query;

        // 1. Fetch all modules for this course
        let { data: modules, error: mError } = await supabase
            .from('modules')
            .select('*')
            .eq('course_id', courseId)
            .order('sequence_number', { ascending: true });

        // FALLBACK: If modules table is missing, or no modules exist, create a default
        if (mError && mError.message.includes('Could not find the table')) {
            console.warn("⚠️  'modules' table missing. Falling back to single-module view.");
            modules = [{ id: 'default-module', title: 'Main Curriculum', sequence_number: 1 }];
        } else if (mError) throw mError;

        // 2. Fetch all lessons for this course
        const { data: lessons, error: lError } = await supabase
            .from('lessons')
            .select('*')
            .eq('course_id', courseId)
            .order('sequence_number', { ascending: true });

        if (lError) throw lError;

        // 3. Group lessons by module_id
        const lessonsByModule = {};
        lessons.forEach(lesson => {
            // Assign to module_id, or default-module if null/no match
            const mId = lesson.module_id && modules.find(m => m.id === lesson.module_id)
                ? lesson.module_id
                : modules[0].id;

            if (!lessonsByModule[mId]) {
                lessonsByModule[mId] = [];
            }
            lessonsByModule[mId].push(lesson);
        });

        // 4. Combine into nested structure
        const result = modules.map(mod => ({
            ...mod,
            lessons: (lessonsByModule[mod.id] || []).sort((a, b) => (a.sequence_number || 0) - (b.sequence_number || 0))
        }));

        res.json(result);
    } catch (error) {
        console.error("getCourseModules Error:", error);
        res.status(500).json({ error: error.message });
    }
}

async function saveLessonQuiz(req, res) {
    try {
        const { lessonId } = req.params;
        const { data } = req.body;

        if (!lessonId || lessonId.startsWith('temp-')) {
            return res.status(400).json({ error: "Cannot save quiz for unsaved lesson. Please save lesson metadata first." });
        }

        // 1. Delete old quizzes for this lesson
        await supabase.from('quizzes').delete().eq('lesson_id', lessonId);

        // 2. Insert new questions as individual rows
        if (data && Array.isArray(data) && data.length > 0) {
            const rowsRows = data.map(q => ({
                lesson_id: lessonId,
                question: q.question,
                options: q.options,
                correct_answer: q.answer || q.correct_answer
            }));
            const { error: insertErr } = await supabase.from('quizzes').insert(rowsRows);
            if (insertErr) throw insertErr;
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Save Quiz Error:", error);
        res.status(500).json({ error: error.message });
    }
}

async function getLessonQuiz(req, res) {
    try {
        const { lessonId } = req.params;
        const { data, error } = await supabase
            .from('quizzes')
            .select('*')
            .eq('lesson_id', lessonId);

        if (error) throw error;

        // Flatten data if it exists in a 'data' column (backwards compatibility)
        const refined = (data || []).map(q => {
            if (q.data && typeof q.data === 'object') {
                return { ...q, ...q.data };
            }
            return q;
        });

        // Wrap to maintain frontend backward compatibility where it expects data[0].data
        res.json([{ data: refined }]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getLesson(req, res) {
    try {
        const { lessonId } = req.params;
        const { data, error } = await supabase
            .from('lessons')
            .select('*')
            .eq('id', lessonId)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function completeLesson(req, res) {
    try {
        const { participantId, lessonId, score } = req.body;

        if (!participantId || !lessonId) {
            return res.status(400).json({ error: 'participantId and lessonId are required.' });
        }

        // First check if record already exists
        const { data: existing } = await supabase
            .from('student_progress')
            .select('id')
            .eq('participant_id', participantId)
            .eq('lesson_id', lessonId)
            .single();

        let data, error;
        if (existing) {
            // Update existing record
            const result = await supabase
                .from('student_progress')
                .update({ status: 'completed', score: score })
                .eq('participant_id', participantId)
                .eq('lesson_id', lessonId)
                .select();
            data = result.data;
            error = result.error;
        } else {
            // Insert new record
            const result = await supabase
                .from('student_progress')
                .insert([{ participant_id: participantId, lesson_id: lessonId, status: 'completed', score: score }])
                .select();
            data = result.data;
            error = result.error;
        }

        if (error) throw error;

        // Fetch the lesson to see if it has a grant
        const { data: lesson } = await supabase
            .from('lessons')
            .select('*')
            .eq('id', lessonId)
            .single();

        if (lesson && lesson.grant_amount > 0) {
            console.log(`Grant detected: ${lesson.grant_amount} cUSD. Triggering blockchain payout...`);
            try {
                // Fetch participant wallet
                const { data: participant } = await supabase
                    .from('participants')
                    .select('wallet_address')
                    .eq('id', participantId)
                    .single();

                if (participant && participant.wallet_address) {
                    const milestone = lesson.track_label || `M_${lesson.id}`;
                    console.log(`Executing Celo transaction for milestone: ${milestone}...`);

                    // Blockchain logic: 
                    // 1. Mark complete 
                    // 2. Release funds
                    const txComplete = await grantDisbursementContract.completeMilestone(participant.wallet_address, milestone);
                    await txComplete.wait();

                    const txRelease = await grantDisbursementContract.releaseGrant(participant.wallet_address);
                    const receipt = await txRelease.wait();

                    console.log(`Grant dispersed! Tx: ${receipt.hash}`);

                    // Log to grants table
                    await supabase
                        .from('grants')
                        .insert([{
                            participant_id: participantId,
                            milestone: milestone,
                            tx_hash: receipt.hash
                        }]);
                }
            } catch (payoutError) {
                console.error("Blockchain payout failed:", payoutError.message);
                // We still report lesson completion success even if payout fails (for dashboard visibility)
            }
        }

        res.json({ message: "Lesson completed!", data, grant_triggered: !!(lesson && lesson.grant_amount > 0) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getProgressOverview(req, res) {
    try {
        const { participantId } = req.params;

        const { data: progress } = await supabase
            .from('student_progress')
            .select('*')
            .eq('participant_id', participantId)
            .eq('status', 'completed');

        const { count: totalModules } = await supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true });

        res.json({
            completedCount: progress?.length || 0,
            totalModules: totalModules || 16,
            percentage: totalModules ? Math.round((progress?.length / totalModules) * 100) : 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getAllParticipantsWithProgress(req, res) {
    try {
        // Pagination parameters (default page=1, limit=20)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const start = (page - 1) * limit;
        const end = start + limit - 1;

        // Fetch participants with progress data (paginated)
        const { data: participants, error } = await supabase
            .from('participants')
            .select(`
                id,
                first_name,
                last_name,
                phone,
                wallet_address,
                did,
                created_at,
                student_progress(lesson_id, status)
            `)
            .range(start, end);

        if (error) throw error;

        // Total modules count for percentage calculation
        const { count: totalModules } = await supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true });

        // Format participants with progress stats
        const formatted = participants.map(p => {
            const completedCount = p.student_progress?.filter(sp => sp.status === 'completed').length || 0;
            return {
                ...p,
                completedCount,
                totalModules,
                percentage: totalModules ? Math.round((completedCount / totalModules) * 100) : 0
            };
        });

        // Also return pagination metadata
        const { count: totalCount } = await supabase
            .from('participants')
            .select('*', { count: 'exact', head: true });

        res.json({
            participants: formatted,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit),
                totalCount
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function updateCourseStatus(req, res) {
    try {
        const { courseId, isPublished } = req.body;
        const { error } = await supabase
            .from('courses')
            .update({ is_published: isPublished })
            .eq('id', courseId);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getSystemSettings(req, res) {
    try {
        const { data, error } = await supabase
            .from('system_settings')
            .select('*');

        if (error) throw error;
        const settings = {};
        data.forEach(s => settings[s.key] = s.value);
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function updateSystemSetting(req, res) {
    try {
        const { key, value } = req.body;
        const { error } = await supabase
            .from('system_settings')
            .upsert({ key, value, updated_at: new Date() });

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function updateCourse(req, res) {
    try {
        const { courseId } = req.params;
        const data = { ...req.body };

        // Clean up data based on known schema to prevent 500s
        const validFields = ['title', 'description', 'image_url', 'category', 'track_number', 'color_code', 'is_published', 'learning_outcome', 'cover_url'];
        const updateData = {};
        Object.keys(data).forEach(key => {
            if (validFields.includes(key)) {
                // Fallback mappings if columns are missing
                if (key === 'learning_outcome') updateData['description'] = data[key];
                else if (key === 'cover_url') updateData['image_url'] = data[key];
                else updateData[key] = data[key];
            }
        });

        const { error } = await supabase
            .from('courses')
            .update(updateData)
            .eq('id', courseId);

        if (error && error.message.includes('column') && error.message.includes('does not exist')) {
            console.warn("Retry Update: Column mismatch. Using minimal set.");
            const minimalData = { title: data.title, is_published: data.is_published };
            const { error: retryError } = await supabase.from('courses').update(minimalData).eq('id', courseId);
            if (retryError) throw retryError;
            return res.json({ success: true, warning: 'Some fields ignored due to schema mismatch' });
        }
        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function updateModule(req, res) {
    try {
        const { moduleId } = req.params;
        const updateData = { ...req.body };
        const { error } = await supabase
            .from('modules')
            .update(updateData)
            .eq('id', moduleId);
        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function updateLesson(req, res) {
    try {
        const { lessonId } = req.params;
        const updateData = { ...req.body };
        const { error } = await supabase
            .from('lessons')
            .update(updateData)
            .eq('id', lessonId);
        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function createCourse(req, res) {
    try {
        const { title, learning_outcome, track_number, cover_url } = req.body;

        // Build resilient insert object based on discovered schema
        const insertData = {
            title,
            track_number,
            is_published: false
        };

        // Fallback for cover_url/image_url
        insertData.image_url = cover_url || null;

        // Fallback for learning_outcome/description
        insertData.description = learning_outcome || null;

        const { data, error } = await supabase
            .from('courses')
            .insert([insertData])
            .select();

        if (error) {
            // If the failure was due to a single missing column (e.g. learning_outcome)
            // retry with only core columns
            if (error.message.includes('column') && error.message.includes('does not exist')) {
                console.warn(`Retry: Insertion failed on columns. Trying restricted set. Error was: ${error.message}`);
                const { data: retryData, error: retryError } = await supabase
                    .from('courses')
                    .insert([{ title, track_number, is_published: false }])
                    .select();
                if (retryError) throw retryError;
                return res.json(retryData[0]);
            }
            throw error;
        }
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


async function deleteCourse(req, res) {
    try {
        const { courseId } = req.params;

        // 1. Fetch all lessons and modules associated with this course
        const { data: lessons, error: lFetchError } = await supabase
            .from('lessons')
            .select('id')
            .eq('course_id', courseId);

        if (lFetchError) throw lFetchError;

        const { data: modules, error: mFetchError } = await supabase
            .from('modules')
            .select('id')
            .eq('course_id', courseId);

        if (mFetchError && !mFetchError.message.includes('not find')) throw mFetchError;

        const lessonIds = lessons?.map(l => l.id) || [];
        const moduleIds = modules?.map(m => m.id) || [];

        console.log(`Deleting Course ${courseId}: Found ${lessonIds.length} lessons and ${moduleIds.length} modules.`);

        // 2. Delete progress records for these lessons
        if (lessonIds.length > 0) {
            // Delete from new lesson_completions table to satisfy foreign keys
            const { error: pError } = await supabase.from('lesson_completions').delete().in('lesson_id', lessonIds);
            if (pError && !pError.message.includes('not find')) throw pError;

            // 3. Delete quizzes for these lessons
            await supabase.from('quizzes').delete().in('lesson_id', lessonIds);
        }

        // 4. Delete the lessons themselves
        await supabase.from('lessons').delete().in('id', lessonIds);

        // 5. Delete the modules
        if (moduleIds.length > 0) {
            await supabase.from('modules').delete().eq('course_id', courseId);
        }

        // 6. Finally delete the course
        const { error } = await supabase
            .from('courses')
            .delete()
            .eq('id', courseId);

        if (error) throw error;

        res.json({ success: true, message: "Course and all related data purged successfully." });
    } catch (error) {
        console.error("deleteCourse Error:", error);
        res.status(500).json({ error: error.message });
    }
}

async function createModule(req, res) {
    try {
        const { course_id, title, sequence_number } = req.body;
        const { data, error } = await supabase
            .from('modules')
            .insert([{ course_id, title, sequence_number }])
            .select();

        if (error && error.message.includes('Could not find the table')) {
            console.warn("⚠️  'modules' table missing. Simulating module creation.");
            return res.json({ id: 'dummy-' + Date.now(), title, sequence_number, course_id, is_simulated: true });
        }
        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function deleteModule(req, res) {
    try {
        const { moduleId } = req.params;

        // 1. Fetch lessons
        const { data: lessons, error: lFetchError } = await supabase
            .from('lessons')
            .select('id')
            .eq('module_id', moduleId);

        if (lFetchError) throw lFetchError;

        const lessonIds = lessons.map(l => l.id);

        if (lessonIds.length > 0) {
            // Delete participant progress
            const { error: pError } = await supabase.from('participant_progress').delete().in('lesson_id', lessonIds);
            if (pError && !pError.message.includes('not find')) throw pError;

            // Delete quizzes
            await supabase.from('quizzes').delete().in('lesson_id', lessonIds);

            // Delete the lessons
            const { error: lError } = await supabase
                .from('lessons')
                .delete()
                .eq('module_id', moduleId);

            if (lError) throw lError;
        }

        // 2. Delete the module itself
        const { error } = await supabase
            .from('modules')
            .delete()
            .eq('id', moduleId);
        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function createLesson(req, res) {
    try {
        const { course_id, module_id, title, sequence_number, grant_amount, video_url, content } = req.body;

        // Fetch default grant from settings if not provided
        let finalGrant = grant_amount;
        if (finalGrant === undefined || finalGrant === null) {
            const { data: settings } = await supabase
                .from('system_settings')
                .select('value')
                .eq('key', 'default_lesson_grant')
                .single();
            finalGrant = settings?.value || 30;
        }

        const { data, error } = await supabase
            .from('lessons')
            .insert([
                {
                    course_id,
                    module_id,
                    title,
                    sequence_number,
                    grant_amount: finalGrant,
                    video_url: video_url || '',
                    content: content || ''
                }
            ])
            .select();
        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


async function deleteLesson(req, res) {
    try {
        const { lessonId } = req.params;

        // 1. Delete participant progress
        const { error: pError } = await supabase.from('participant_progress').delete().eq('lesson_id', lessonId);
        if (pError && !pError.message.includes('not find')) throw pError;

        // 2. Delete quizzes
        await supabase.from('quizzes').delete().eq('lesson_id', lessonId);

        // 3. Delete the lesson itself
        const { error } = await supabase
            .from('lessons')
            .delete()
            .eq('id', lessonId);
        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function generateQuiz(req, res) {
    try {
        const { lessonId, title, learning_outcome, content } = req.body;
        if (!title && !learning_outcome && !content) {
            return res.status(400).json({ error: 'Missing data for quiz generation' });
        }
        const prompt = `You are an instructional designer. Create a short 5-question multiple-choice quiz (4 options each) for the following lesson.\n\nLesson Title: ${title || 'N/A'}\nLearning Outcome: ${learning_outcome || 'N/A'}\nLesson Content (summary): ${content || 'N/A'}\n\nReturn the result as a JSON array with objects: { "question": string, "options": [string, string, string, string], "answer": string }`;
        const openaiKey = process.env.OPENAI_API_KEY;
        if (!openaiKey) {
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
            console.error('OpenAI error:', err);
            return res.status(502).json({ error: 'Failed to generate quiz' });
        }
        const data = await response.json();
        const raw = data.choices?.[0]?.message?.content?.trim();
        let quiz;
        try {
            quiz = JSON.parse(raw);
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
            const rowsRows = quiz.map(q => ({
                lesson_id: lessonId,
                question: q.question,
                options: q.options,
                correct_answer: q.answer || q.correct_answer
            }));
            const { error } = await supabase.from('quizzes').insert(rowsRows);
            if (error) console.warn('Failed to store generated quiz:', error);
        }
        res.json({ quiz });
    } catch (err) {
        console.error('Quiz generation error:', err);
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getCourses,
    getCourseModules,
    getLessonQuiz,
    completeLesson,
    getProgressOverview,
    getAllParticipantsWithProgress,
    updateCourseStatus,
    getSystemSettings,
    updateSystemSetting,
    getLesson,
    updateCourse,
    updateModule,
    updateLesson,
    createCourse,
    deleteCourse,
    createModule,
    deleteModule,
    createLesson,
    deleteLesson,
    generateQuiz,
    saveLessonQuiz
};
