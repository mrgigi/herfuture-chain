const supabase = require('../services/supabaseService');
const { grantDisbursementContract } = require('../services/blockchainService');

async function getCourses(req, res) {
    try {
        // Fetch courses along with their lessons and the student progress for those lessons
        const { data, error } = await supabase
            .from('courses')
            .select(`
                *,
                lessons (
                    id,
                    student_progress (
                        participant_id
                    )
                )
            `)
            .order('track_number', { ascending: true });

        if (error) throw error;
        if (!data) return res.json([]);

        // Process data to include a unique student count per course
        const formatted = data.map(course => {
            const participantIds = new Set();
            (course.lessons || []).forEach(lesson => {
                (lesson.student_progress || []).forEach(sp => {
                    participantIds.add(sp.participant_id);
                });
            });

            // Remove the raw lessons/progress data to keep response clean if not needed by other parts
            const { lessons, ...courseData } = course;
            return {
                ...courseData,
                student_count: participantIds.size
            };
        });

        res.json(formatted);
    } catch (error) {
        console.error('Get Courses Error:', error);
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
        } else if (mError) {
            throw mError;
        }

        if (!modules || modules.length === 0) {
            modules = [{ id: 'default-module', title: 'Main Curriculum', sequence_number: 1 }];
        }

        // 2. Fetch all lessons for this course
        const { data: lessons, error: lError } = await supabase
            .from('lessons')
            .select('*')
            .eq('course_id', courseId)
            .order('sequence_number', { ascending: true });

        if (lError) throw lError;

        // 3. Group lessons by module_id
        const lessonsByModule = {};
        (lessons || []).forEach(lesson => {
            // Assign to module_id, or default-module if null/no match
            const matchingModule = modules.find(m => m.id === lesson.module_id);
            const mId = matchingModule ? lesson.module_id : modules[0].id;

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

        // Normalize rows: flatten any legacy `data` column, and normalize `correct_answer` -> `answer`
        const refined = (data || []).map(q => {
            let row = q;
            if (q.data && typeof q.data === 'object') {
                row = { ...q, ...q.data };
            }
            // Normalize correct_answer -> answer for frontend compatibility
            return {
                question: row.question,
                options: row.options,
                answer: row.answer || row.correct_answer
            };
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
            // Check if grant disbursement is active in system settings
            const { data: settingsData } = await supabase
                .from('system_settings')
                .select('value')
                .eq('key', 'grant_disbursement_active')
                .single();

            const isDisbursementActive = settingsData ? settingsData.value : true;

            if (!isDisbursementActive) {
                console.log(`[LMS] Grant detected, but disbursement is currently PAUSED. Skipping payout.`);
            } else {
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
        }

        res.json({ message: "Lesson completed!", data, grant_triggered: !!(lesson && lesson.grant_amount > 0) });
    } catch (error) {
        console.error("completeLesson error:", error);
        res.status(500).json({ error: error.message });
    }
}

async function getProgressOverview(req, res) {
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
        // Sort lessons by track_number (from course) then sequence_number to find the "next" one
        const sortedLessons = lessons.map(l => {
            const course = courses?.find(c => c.id === l.course_id);
            return { ...l, track_number: course?.track_number || 999 };
        }).sort((a, b) => {
            if (a.track_number !== b.track_number) return a.track_number - b.track_number;
            return (a.sequence_number || 0) - (b.sequence_number || 0);
        });

        // The "next" lesson is the first one in the sorted list that the user HAS NOT completed
        const nextLesson = sortedLessons.find(l => !completedLessonIds.has(l.id));
        const upcomingReward = nextLesson ? (Number(nextLesson.grant_amount) || 0) : 0;

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
    } catch (error) {
        console.error("getProgressOverview error:", error);
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

        // Find all published course IDs
        const { data: publishedCourses } = await supabase
            .from('courses')
            .select('id')
            .eq('is_published', true);

        const publishedCourseIds = (publishedCourses || []).map(c => c.id);

        // Total modules (lessons) count from published courses only
        let totalModules = 0;
        if (publishedCourseIds.length > 0) {
            const { count } = await supabase
                .from('lessons')
                .select('*', { count: 'exact', head: true })
                .in('course_id', publishedCourseIds);
            totalModules = count || 0;
        }

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
        console.log(`[LMS] SETTING COURSE ${courseId} PUBLISHED: ${isPublished}`);
        const { error } = await supabase
            .from('courses')
            .update({ is_published: isPublished })
            .eq('id', courseId);

        if (error) {
            console.error(`[LMS] Update Course Status Error:`, error);
            throw error;
        }
        res.json({ success: true });
    } catch (error) {
        console.error(`[LMS] Update Course Status Exception:`, error);
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
    console.log(`[LMS] Updating course ${req.params.courseId}...`);
    try {
        const { courseId } = req.params;
        const data = { ...req.body };
        console.log(`[LMS] Received data keys: ${Object.keys(data).join(', ')}`);

        // Use direct mapping - schema is confirmed to have all these columns
        const updateData = {
            title: data.title,
            description: data.description,
            image_url: data.image_url,
            track_number: data.track_number,
            is_published: data.is_published,
            learning_outcome: data.learning_outcome,
            cover_url: data.image_url // Sync cover_url if it exists too
        };

        // Remove undefined fields
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) delete updateData[key];
        });

        console.log(`[LMS] Final update payload keys: ${Object.keys(updateData).join(', ')}`);

        const { error } = await supabase
            .from('courses')
            .update(updateData)
            .eq('id', courseId);

        if (error) {
            console.error(`[LMS] Supabase Update Error:`, error);
            throw error;
        }

        console.log(`[LMS] Course ${courseId} updated successfully.`);
        res.json({ success: true });
    } catch (error) {
        console.error(`[LMS] updateCourse Exception:`, error);
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

async function reorderCurriculum(req, res) {
    console.log(`[LMS] Reordering curriculum items...`);
    try {
        const { type, items } = req.body; // type: 'module' or 'lesson', items: [{id, sequence_number, module_id?}]

        const table = type === 'module' ? 'modules' : 'lessons';

        // Use a transaction-like approach with multiple updates
        const promises = items.map(item => {
            const updateData = { sequence_number: item.sequence_number };
            if (item.module_id) updateData.module_id = item.module_id;

            return supabase
                .from(table)
                .update(updateData)
                .eq('id', item.id);
        });

        const results = await Promise.all(promises);
        const errors = results.filter(r => r.error).map(r => r.error);

        if (errors.length > 0) {
            console.error(`[LMS] Error reordering ${type}:`, errors);
            return res.status(500).json({ error: 'Some items failed to update', details: errors });
        }

        res.json({ success: true });
    } catch (error) {
        console.error(`[LMS] Reorder exception:`, error);
        res.status(500).json({ error: error.message });
    }
}

async function createCourse(req, res) {
    console.log(`[LMS] Creating new course...`);
    try {
        const { title, learning_outcome, track_number, image_url } = req.body;

        const insertData = {
            title,
            track_number: track_number || 1,
            learning_outcome: learning_outcome || null,
            image_url: image_url || null,
            is_published: false
        };

        const { data, error } = await supabase
            .from('courses')
            .insert([insertData])
            .select();

        if (error) {
            console.error(`[LMS] Supabase Create Error:`, error);
            throw error;
        }

        console.log(`[LMS] Course created with ID: ${data[0].id}`);
        res.json(data[0]);
    } catch (error) {
        console.error(`[LMS] createCourse Exception:`, error);
        res.status(500).json({ error: error.message });
    }
}


async function deleteCourse(req, res) {
    try {
        const { courseId } = req.params;
        console.log(`[LMS] PURGING COURSE: ${courseId}`);

        // 1. Get all modules
        const { data: modules, error: mErr } = await supabase.from('modules').select('id').eq('course_id', courseId);
        if (mErr) {
            console.warn(`[LMS] Error fetching modules for course ${courseId}:`, mErr.message);
        }
        const moduleIds = (modules || []).map(m => m.id);

        // 2. Get all lessons
        const { data: lessons, error: lErr } = await supabase.from('lessons').select('id').eq('course_id', courseId);
        if (lErr) {
            console.warn(`[LMS] Error fetching lessons for course ${courseId}:`, lErr.message);
        }
        const lessonIds = (lessons || []).map(l => l.id);

        if (lessonIds.length > 0) {
            console.log(`[LMS] Purging ${lessonIds.length} lessons and progress...`);
            // Cleanup all lesson-related data across all potential progress/tracking tables
            await supabase.from('student_progress').delete().in('lesson_id', lessonIds);
            await supabase.from('lesson_completions').delete().in('lesson_id', lessonIds);
            await supabase.from('quizzes').delete().in('lesson_id', lessonIds);
            const { error: lessonsDeleteErr } = await supabase.from('lessons').delete().in('id', lessonIds);
            if (lessonsDeleteErr) console.error(`[LMS] Failed to delete lessons rows:`, lessonsDeleteErr.message);
        }

        if (moduleIds.length > 0) {
            console.log(`[LMS] Purging ${moduleIds.length} modules...`);
            const { error: modulesDeleteErr } = await supabase.from('modules').delete().in('id', moduleIds);
            if (modulesDeleteErr) console.error(`[LMS] Failed to delete modules rows:`, modulesDeleteErr.message);
        }

        // 3. Delete the course
        const { error } = await supabase.from('courses').delete().eq('id', courseId);
        if (error) {
            console.error(`[LMS] Final Course deletion failed:`, error.message);
            throw error;
        }

        res.json({ success: true, message: "Course and all related data purged successfully." });
    } catch (error) {
        console.error("[LMS] deleteCourse Global Error:", error);
        res.status(500).json({ error: error.message });
    }
}

async function createModule(req, res) {
    try {
        const { course_id, title, sequence_number } = req.body;
        console.log(`[LMS] Creating module: "${title}" for course ${course_id}...`);
        const { data, error } = await supabase
            .from('modules')
            .insert([{ course_id, title, sequence_number }])
            .select();

        if (error && error.message.includes('Could not find the table')) {
            console.warn("⚠️  'modules' table missing. Simulating module creation.");
            return res.json({ id: 'dummy-' + Date.now(), title, sequence_number, course_id, is_simulated: true });
        }
        if (error) {
            console.error(`[LMS] Create Module Error:`, error);
            throw error;
        }
        console.log(`[LMS] Module created successfully with ID: ${data[0].id}`);
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function deleteModule(req, res) {
    try {
        const { moduleId } = req.params;
        console.log(`[LMS] DELETING MODULE: ${moduleId}`);

        const { data: lessons } = await supabase.from('lessons').select('id').eq('module_id', moduleId);
        const lessonIds = (lessons || []).map(l => l.id);

        if (lessonIds.length > 0) {
            console.log(`[LMS] Cleaning up ${lessonIds.length} lessons...`);
            await supabase.from('student_progress').delete().in('lesson_id', lessonIds);
            await supabase.from('lesson_completions').delete().in('lesson_id', lessonIds);
            await supabase.from('quizzes').delete().in('lesson_id', lessonIds);
            await supabase.from('lessons').delete().eq('module_id', moduleId);
        }

        const { error } = await supabase.from('modules').delete().eq('id', moduleId);
        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error("[LMS] deleteModule Error:", error);
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

        console.log(`[LMS] Creating lesson: "${title}" for module ${module_id}...`);
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
        if (error) {
            console.error(`[LMS] Create Lesson Error:`, error);
            throw error;
        }
        console.log(`[LMS] Lesson created successfully with ID: ${data[0].id}`);
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


async function deleteLesson(req, res) {
    try {
        const { lessonId } = req.params;
        console.log(`[LMS] DELETING LESSON: ${lessonId}`);

        await supabase.from('student_progress').delete().eq('lesson_id', lessonId);
        await supabase.from('lesson_completions').delete().eq('lesson_id', lessonId);
        await supabase.from('quizzes').delete().eq('lesson_id', lessonId);

        const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error("[LMS] deleteLesson Error:", error);
        res.status(500).json({ error: error.message });
    }
}

async function generateQuiz(req, res) {
    try {
        const { lessonId, title, learning_outcome, content } = req.body;
        if (!title && !learning_outcome && !content) {
            return res.status(400).json({ error: 'Missing data for quiz generation' });
        }

        // Testing Phase: Requesting exactly 3 questions per lesson
        const prompt = `You are an instructional designer. Create exactly 3 multiple-choice questions (4 options each) for the following lesson.\n\nLesson Title: ${title || 'N/A'}\nLearning Outcome: ${learning_outcome || 'N/A'}\nLesson Content (summary): ${content || 'N/A'}\n\nReturn the result as a JSON array containing exactly 3 objects: [{ "question": string, "options": [string, string, string, string], "answer": string }]`;

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
    saveLessonQuiz,
    reorderCurriculum
};
