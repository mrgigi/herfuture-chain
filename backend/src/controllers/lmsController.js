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
        const { data: modules, error: mError } = await supabase
            .from('modules')
            .select('*')
            .eq('course_id', courseId)
            .order('sequence_number', { ascending: true });

        if (mError) throw mError;

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
            if (!lessonsByModule[lesson.module_id]) {
                lessonsByModule[lesson.module_id] = [];
            }
            lessonsByModule[lesson.module_id].push(lesson);
        });

        // 4. Combine into nested structure
        const result = modules.map(mod => ({
            ...mod,
            lessons: lessonsByModule[mod.id] || []
        }));

        res.json(result);
    } catch (error) {
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
        res.json(data);
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

        const { data, error } = await supabase
            .from('student_progress')
            .upsert({
                participant_id: participantId,
                lesson_id: lessonId,
                status: 'completed',
                score: score
            })
            .select();

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
        const { title, category } = req.body;
        const { error } = await supabase
            .from('courses')
            .update({ title, category })
            .eq('id', courseId);
        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function updateModule(req, res) {
    try {
        const { moduleId } = req.params;
        const { title } = req.body;
        const { error } = await supabase
            .from('modules')
            .update({ title })
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
        const { title, grant_amount } = req.body;
        const { error } = await supabase
            .from('lessons')
            .update({ title, grant_amount })
            .eq('id', lessonId);
        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function createCourse(req, res) {
    try {
        const { title, category, track_number } = req.body;
        const { data, error } = await supabase
            .from('courses')
            .insert([{ title, category, track_number, is_published: false }])
            .select();
        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function deleteCourse(req, res) {
    try {
        const { courseId } = req.params;
        const { error } = await supabase
            .from('courses')
            .delete()
            .eq('id', courseId);
        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
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
        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function deleteModule(req, res) {
    try {
        const { moduleId } = req.params;
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
        const { course_id, module_id, title, sequence_number, grant_amount, video_url } = req.body;
        const { data, error } = await supabase
            .from('lessons')
            .insert([{ course_id, module_id, title, sequence_number, grant_amount: grant_amount || 0, video_url: video_url || '' }])
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
    deleteLesson
};
