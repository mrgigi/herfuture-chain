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

module.exports = {
    releaseGrant,
    getGrants
};
