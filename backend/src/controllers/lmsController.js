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
        const { participantId } = req.query; // Pass participantId to check locks

        const { data: modules, error } = await supabase
            .from('lessons')
            .select('*')
            .eq('course_id', courseId)
            .order('sequence_number', { ascending: true });

        if (error) throw error;

        if (!participantId) {
            return res.json(modules.map(m => ({ ...m, locked: m.sequence_number > 1 })));
        }

        // Get completed modules for this participant
        const { data: progress } = await supabase
            .from('student_progress')
            .select('lesson_id, status')
            .eq('participant_id', participantId)
            .eq('status', 'completed');

        const completedIds = new Set(progress?.map(p => p.lesson_id) || []);

        // Logic: Module is unlocked if it's the first one OR if the previous exists and is completed
        // For simplicity in the demo, we'll fetch ALL modules briefly to check sequencing
        const { data: allModules } = await supabase
            .from('lessons')
            .select('id, sequence_number')
            .order('sequence_number', { ascending: true });

        const modulesWithLock = modules.map(m => {
            const isFirst = m.sequence_number === 1;
            const prevModule = allModules.find(am => am.sequence_number === m.sequence_number - 1);
            const isUnlocked = isFirst || (prevModule && completedIds.has(prevModule.id));

            return {
                ...m,
                locked: !isUnlocked,
                completed: completedIds.has(m.id)
            };
        });

        res.json(modulesWithLock);
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
    getLesson
};
