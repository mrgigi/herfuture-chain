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

        // 1. Fetch grants for the participant
        const { data: grants, error: gError } = await supabase
            .from('grants')
            .select('*')
            .eq('participant_id', participantId)
            .order('created_at', { ascending: false });

        if (gError) {
            console.error("Supabase grants fetch error:", gError);
            throw new Error("Failed to fetch grants from Supabase");
        }

        // 2. Fetch all lessons to map milestone labels to names and amounts
        // We match grant.milestone with lesson.track_label
        const { data: lessons, error: lError } = await supabase
            .from('lessons')
            .select('track_label, title, grant_amount');

        if (lError) {
            console.error("Supabase lessons fetch error:", lError);
            // Non-blocking, we'll just return raw data if mapping fails
        }

        const formattedGrants = grants.map(grant => {
            const lesson = (lessons || []).find(l => l.track_label === grant.milestone || `M_${l.id}` === grant.milestone);
            return {
                ...grant,
                milestone_name: lesson ? lesson.title : `Milestone ${grant.milestone}`,
                amount: grant.amount || (lesson ? lesson.grant_amount : 0)
            };
        });

        return res.status(200).json(formattedGrants);
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

        // 4. Calculate total amount (Sum directly from grants table)
        const { data: grantsData } = await supabase
            .from('grants')
            .select('amount');

        let totalAmount = 0;
        grantsData.forEach(g => {
            totalAmount += (Number(g.amount) || 0);
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
            const lesson = lessons.find(l => l.track_label === g.milestone || `M_${l.id}` === g.milestone);
            return {
                student: g.participants ? `${g.participants.first_name || 'Student'} ${g.participants.last_name || ''}`.trim() : 'Anonymous',
                amount: g.amount || (lesson ? lesson.grant_amount : 0),
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
