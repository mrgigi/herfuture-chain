const { uploadToIPFS } = require('../services/ipfsService');
const { credentialRegistryContract } = require('../services/blockchainService');
const supabase = require('../services/supabaseService');

/**
 * Issues a credential via IPFS and Smart Contract
 */
async function issueCredential(req, res) {
    try {
        const { participant_id, skill, course_data } = req.body;

        if (!participant_id || !skill) {
            return res.status(400).json({ error: "Missing required parameters (participant_id, skill)" });
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
        if (!walletAddress) {
            return res.status(400).json({ error: "Participant has no assigned wallet address!" });
        }

        // 2. Draft metadata JSON for the verifiable credential
        const metadata = {
            id: `did:celo:${walletAddress}`,
            name: participant.name,
            skill: skill,
            course_data: course_data || {},
            issued_at: new Date().toISOString()
        };

        // 3. Upload JSON to IPFS 
        const ipfsHash = await uploadToIPFS(metadata);

        // 4. Issue credential on Celo via Smart Contract
        console.log(`Sending tx to IPFS Hash ${ipfsHash} for Address ${walletAddress}`);
        const tx = await credentialRegistryContract.issueCredential(walletAddress, skill, ipfsHash);
        const receipt = await tx.wait();

        // 5. Save the resulting hash and CID to Supabase
        const { error: insertError } = await supabase
            .from('credentials')
            .insert([{
                participant_id: participant.id,
                skill: skill,
                ipfs_hash: ipfsHash,
                tx_hash: receipt.hash
            }]);

        if (insertError) {
            console.error("Supabase insert error for credential:", insertError);
            return res.status(500).json({ error: "Failed to save credential details to DB" });
        }

        return res.status(201).json({
            message: "Credential issued successfully",
            ipfsHash: ipfsHash,
            transactionHash: receipt.hash
        });

    } catch (err) {
        console.error("Issue Credential Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

/**
 * Verifies validity of a credential directly out of the smart contract registry
 */
async function verifyCredential(req, res) {
    try {
        const { credentialId } = req.params;

        if (!credentialId) {
            return res.status(400).json({ error: "Missing credentialId parameter" });
        }

        // Call the new getCredential function on the contract
        const credential = await credentialRegistryContract.getCredential(credentialId);

        // If the contract call succeeds (doesn't revert), it's a valid credential
        return res.status(200).json({
            verified: true,
            credentialId: credential.credentialId.toString(),
            participant: credential.participant,
            credentialType: credential.credentialType,
            ipfsHash: credential.ipfsHash,
            timestamp: new Date(Number(credential.timestamp) * 1000).toISOString()
        });

    } catch (err) {
        // If the contract reverts, it's likely because the credential doesn't exist
        console.log(`Verification failed for ID ${req.params.credentialId}: ${err.message}`);
        return res.status(200).json({
            verified: false,
            credentialId: req.params.credentialId
        });
    }
}

/**
 * Retrieves all credentials for a given address directly from the blockchain
 */
async function getCredentialsByAddress(req, res) {
    try {
        const { address } = req.params;
        if (!address) {
            return res.status(400).json({ error: "Missing address parameter" });
        }

        const rawCredentials = await credentialRegistryContract.getCredentials(address);

        // 1. Format the blockchain results
        let credentials = rawCredentials.map(cred => ({
            id: cred.credentialId.toString(),
            credentialType: cred.credentialType,
            ipfsHash: cred.ipfsHash,
            timestamp: new Date(Number(cred.timestamp) * 1000).toISOString()
        }));

        // 2. Fallback to Supabase for recorded credentials
        // First find participant by address
        const { data: participant } = await supabase
            .from('participants')
            .select('id')
            .eq('wallet_address', address)
            .single();

        if (participant) {
            const { data: dbCerts } = await supabase
                .from('credentials')
                .select('*')
                .eq('participant_id', participant.id);

            if (dbCerts && dbCerts.length > 0) {
                const mappedDbCerts = dbCerts.map(c => ({
                    id: c.credential_id.toString(),
                    credentialType: c.skill,
                    ipfsHash: c.ipfs_hash,
                    timestamp: c.created_at,
                    txHash: c.tx_hash,
                    isDemo: c.tx_hash === 'PENDING_ONCHAIN'
                }));

                // Combine and avoid duplicates by IPFS hash
                const existingHashes = new Set(credentials.map(cr => cr.ipfsHash));
                mappedDbCerts.forEach(mc => {
                    if (!existingHashes.has(mc.ipfsHash)) {
                        credentials.push(mc);
                    }
                });
            }
        }

        return res.status(200).json(credentials);
    } catch (err) {
        console.error("Get Credentials Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    issueCredential,
    verifyCredential,
    getCredentialsByAddress
};
