const { grantDisbursementContract } = require('../services/blockchainService');
const supabase = require('../services/supabaseService');

/**
 * Marks a milestone as completed on the Smart Contract 
 * and subsequently releases accumulated funds to the participant.
 */
async function releaseGrant(req, res) {
    try {
        const { participant_id, milestone } = req.body;

        if (!participant_id || !milestone) {
            return res.status(400).json({ error: "Missing required parameters (participant_id, milestone)" });
        }

        // 1. Fetch participant for their wallet address
        const { data: participant, error: pError } = await supabase
            .from('participants')
            .select('*')
            .eq('id', participant_id)
            .single();

        if (pError || !participant) {
            return res.status(404).json({ error: "Participant not found" });
        }

        const walletAddress = participant.wallet_address;

        // --- System Settings Check ---
        const { data: settingsData } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'grant_disbursement_active')
            .single();

        const isDisbursementActive = settingsData ? settingsData.value : true;

        if (!isDisbursementActive) {
            console.log(`[Grants] Attempted release for ${walletAddress}, but system is PAUSED.`);
            return res.status(403).json({
                error: "Grant disbursement is currently paused by administrator. Manual releases are disabled.",
                system_paused: true
            });
        }

        // --- Smart Contract Interactions ---
        // 2. Mark Milestone Complete on Celo
        console.log(`Setting milestone [${milestone}] complete for address ${walletAddress}...`);
        const txComplete = await grantDisbursementContract.completeMilestone(walletAddress, milestone);
        await txComplete.wait();

        // 3. Trigger Grant Release from Accumulator pool on Celo
        console.log(`Releasing accumulated cUSD for address ${walletAddress}...`);
        const txRelease = await grantDisbursementContract.releaseGrant(walletAddress);
        const receiptRelease = await txRelease.wait();

        // 4. Document grant state to Supabase table
        const totalAmount = 30; // Default
        const withdrawable = totalAmount;
        const savings = 0;
        const investment = 0;

        const { error: insertError } = await supabase
            .from('grants')
            .insert([{
                participant_id: participant.id,
                milestone: milestone,
                withdrawable_amount: withdrawable,
                savings_amount: savings,
                investment_amount: investment,
                tx_hash: receiptRelease.hash
            }]);

        if (insertError) {
            console.error("Supabase insert error for grant:", insertError);
        }

        return res.status(200).json({
            message: "Grants released successfully",
            milestone,
            transactionHash: receiptRelease.hash
        });

    } catch (err) {
        console.error("Release Grant Error:", err);
        return res.status(500).json({ error: "Internal Server Error or Blockchain Error (Make sure Admin wallet has gas and cUSD pooled)" });
    }
}

async function getGrants(req, res) {
    try {
        const { participantId } = req.params;
        if (!participantId) {
            return res.status(400).json({ error: "Missing participantId parameter" });
        }

        // 1. Fetch completed progress for the participant
        const { data: progress, error: pError } = await supabase
            .from('student_progress')
            .select('lesson_id, created_at')
            .eq('participant_id', participantId)
            .eq('status', 'completed')
            .order('created_at', { ascending: false });

        if (pError) throw pError;

        // 2. Fetch all lessons to get grant_amounts and titles
        const { data: lessons, error: lError } = await supabase
            .from('lessons')
            .select('id, track_label, title, grant_amount')
            .gt('grant_amount', 0); // Only lessons that have an actual grant

        if (lError) throw lError;

        // 3. Map progress into a "Grant" object
        const formattedGrants = (progress || [])
            .map(p => {
                const lesson = lessons.find(l => l.id === p.lesson_id);
                if (!lesson) return null; // Skip if no grant was attached
                return {
                    id: `${p.lesson_id}-${p.created_at}`,
                    participant_id: participantId,
                    milestone: lesson.track_label || `M_${lesson.id}`,
                    milestone_name: lesson.title,
                    amount: lesson.grant_amount || 0,
                    withdrawable_amount: lesson.grant_amount || 0,
                    created_at: p.created_at,
                    tx_hash: null // Derived dynamically, tx hash not strictly logged here
                };
            })
            .filter(Boolean);

        return res.status(200).json(formattedGrants);
    } catch (err) {
        console.error("Get Grants Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

async function getGlobalImpactStats(req, res) {
    try {
        // 1. Derive grants from student_progress
        const { data: allProgress } = await supabase
            .from('student_progress')
            .select('lesson_id, created_at')
            .eq('status', 'completed');

        // 2. Get total participants
        const { count: participantsCount } = await supabase
            .from('participants')
            .select('*', { count: 'exact', head: true });

        // 3. Resolve corresponding lessons
        const { data: payableLessons } = await supabase
            .from('lessons')
            .select('id, grant_amount, track_label')
            .gt('grant_amount', 0);

        let totalAmount = 0;
        let grantsDistributed = 0;
        let graduatesCount = 0;

        const payableLessonIds = new Set((payableLessons || []).map(l => l.id));
        const lessonMap = new Map((payableLessons || []).map(l => [l.id, l]));

        (allProgress || []).forEach(p => {
            if (payableLessonIds.has(p.lesson_id)) {
                grantsDistributed++;
                const lesson = lessonMap.get(p.lesson_id);
                totalAmount += (Number(lesson.grant_amount) || 0);

                if (lesson.track_label === '3.6') { // Graduate marker
                    graduatesCount++;
                }
            }
        });

        const baselineTreasury = 10000; // Recalibrated for user scale
        const treasuryBalance = Math.max(0, baselineTreasury - totalAmount);

        res.json({
            totalImpact: totalAmount,
            treasuryBalance: treasuryBalance,
            grantsDistributed: grantsDistributed,
            graduates: graduatesCount,
            countries: 1, // Nigeria
            participants: participantsCount || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getRecentGrants(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const start = (page - 1) * limit;

        // Fetch all progress with participant info
        const { data: allProgress, error, count } = await supabase
            .from('student_progress')
            .select(`
                lesson_id,
                created_at,
                participants (
                    first_name,
                    last_name
                )
            `, { count: 'exact' })
            .eq('status', 'completed')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch lessons
        const { data: payableLessons } = await supabase
            .from('lessons')
            .select('id, title, grant_amount')
            .gt('grant_amount', 0);

        const lessonMap = new Map((payableLessons || []).map(l => [l.id, l]));

        // Filter progress to only include those matching payable lessons
        const grantEvents = (allProgress || [])
            .filter(p => lessonMap.has(p.lesson_id))
            .map(p => {
                const lesson = lessonMap.get(p.lesson_id);
                return {
                    student: p.participants ? `${p.participants.first_name || 'Student'} ${p.participants.last_name || ''}`.trim() : 'Anonymous',
                    amount: lesson.grant_amount || 0,
                    track: lesson.title,
                    tx: null,
                    time: p.created_at
                };
            });

        // Paginate manually since we filtered locally
        const paginatedGrants = grantEvents.slice(start, start + limit);

        // Treasury Balance
        const totalAmountDisbursed = grantEvents.reduce((acc, curr) => acc + curr.amount, 0);
        const baselineTreasury = 10000;
        const treasuryBalance = Math.max(0, baselineTreasury - totalAmountDisbursed);

        res.json({
            grants: paginatedGrants,
            total: grantEvents.length,
            page,
            limit,
            treasuryBalance: treasuryBalance
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    releaseGrant,
    getGrants,
    getGlobalImpactStats,
    getRecentGrants
};
