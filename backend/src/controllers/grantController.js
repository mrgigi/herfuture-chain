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
        const { error: insertError } = await supabase
            .from('grants')
            .insert([{
                participant_id: participant.id,
                milestone: milestone,
                tx_hash: receiptRelease.hash
                // amount would typically be parsed back from contract events or defined config
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

/**
 * Fetches all grant history for a given participant from Supabase.
 */
async function getGrants(req, res) {
    try {
        const { participantId } = req.params;
        if (!participantId) {
            return res.status(400).json({ error: "Missing participantId parameter" });
        }

        const { data, error } = await supabase
            .from('grants')
            .select('*')
            .eq('participant_id', participantId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Supabase grants fetch error:", error);
            throw new Error("Failed to fetch grants from Supabase");
        }

        return res.status(200).json(data);
    } catch (err) {
        console.error("Get Grants Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

async function getGlobalImpactStats(req, res) {
    try {
        // 1. Get total grants count
        const { count: grantsCount } = await supabase
            .from('grants')
            .select('*', { count: 'exact', head: true });

        // 2. Get total participants
        const { count: participantsCount } = await supabase
            .from('participants')
            .select('*', { count: 'exact', head: true });

        // 3. Get graduates (finished Track 3.6)
        const { count: graduatesCount } = await supabase
            .from('grants')
            .select('*', { count: 'exact', head: true })
            .eq('milestone', '3.6');

        // 4. Calculate total amount (Sum from lessons joined with grants)
        const { data: grantsData } = await supabase
            .from('grants')
            .select('milestone');

        const { data: lessons } = await supabase
            .from('lessons')
            .select('track_label, grant_amount');

        let totalAmount = 0;
        grantsData.forEach(g => {
            const lesson = lessons.find(l => l.track_label === g.milestone);
            if (lesson) totalAmount += lesson.grant_amount;
        });

        res.json({
            totalImpact: totalAmount,
            grantsDistributed: grantsCount || 0,
            graduates: graduatesCount || 0,
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
        const end = start + limit - 1;

        const { data, error, count } = await supabase
            .from('grants')
            .select(`
                id,
                milestone,
                tx_hash,
                created_at,
                participants (
                    first_name,
                    last_name
                )
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(start, end);

        if (error) throw error;

        // Fetch lesson titles for the milestones
        const { data: lessons } = await supabase
            .from('lessons')
            .select('track_label, title, grant_amount');

        const formatted = data.map(g => {
            const lesson = lessons.find(l => l.track_label === g.milestone);
            return {
                student: g.participants ? `${g.participants.first_name || 'Student'} ${g.participants.last_name || ''}`.trim() : 'Anonymous',
                amount: lesson ? lesson.grant_amount : 0,
                track: lesson ? lesson.title : g.milestone,
                tx: g.tx_hash,
                time: g.created_at
            };
        });

        res.json({
            grants: formatted,
            total: count,
            page,
            limit
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
