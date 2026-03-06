const supabase = require('../services/supabaseService');

/**
 * Triggered by a Moodle Webhook indicating module completion
 */
async function moduleCompleteWebhook(req, res) {
    try {
        const { email, module_id, score } = req.body;

        if (!email || !module_id) {
            return res.status(400).json({ error: "Missing required parameters from webhook (email, module_id)" });
        }

        // Ideally you'd verify a secret Moodle webhook signature here

        // 1. Fetch participant metadata via webhook email
        const { data: participant, error: pError } = await supabase
            .from('participants')
            .select('*')
            .eq('email', email)
            .single();

        if (pError || !participant) {
            return res.status(404).json({ error: "Participant not found for the given email" });
        }

        // 2. Increment user course_progress or record the specific progression
        const newProgress = participant.course_progress + 1;
        const { error: updateError } = await supabase
            .from('participants')
            .update({ course_progress: newProgress })
            .eq('id', participant.id);

        if (updateError) {
            console.error("Supabase update error:", updateError);
            return res.status(500).json({ error: "Failed to update participant progress" });
        }

        return res.status(200).json({
            message: "Module completed successfully logged",
            participant_id: participant.id,
            progress: newProgress
        });

    } catch (err) {
        console.error("Module Completion Webhook Error:", err.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    moduleCompleteWebhook
};
