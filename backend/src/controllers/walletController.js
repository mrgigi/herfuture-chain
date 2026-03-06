const { ethers } = require('ethers');
const supabase = require('../services/supabaseService');
const { grantDisbursementContract } = require('../services/blockchainService');

/**
 * Creates a participant wallet and decentralized identifier (DID), 
 * stores them in Supabase, and optionally registers them in GrantDisbursement.
 */
async function createWallet(req, res) {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: "Name and email are required" });
        }

        // 1. Generate random wallet using ethers.js
        const wallet = ethers.Wallet.createRandom();
        const address = wallet.address;

        // In a real production setup you might not want to save the private key 
        // in plaintext, or at all, depending on custody model. Sticking to simple for MVP:
        const privateKey = wallet.privateKey;

        // 2. Simplistic DID creation (can integrate with specific DID specs later)
        const did = `did:celo:${address}`;

        // 3. Save to Supabase Participants table
        const { data, error } = await supabase
            .from('participants')
            .insert([{
                name,
                email,
                wallet_address: address,
                did
            }])
            .select('*')
            .single();

        if (error) {
            console.error("Supabase insert error:", error);
            // Handle unique constraint if user already exists
            if (error.code === '23505') {
                return res.status(409).json({ error: "User with this email already exists" });
            }
            throw new Error("Failed to insert into Supabase");
        }

        // 4. Optionally: Pre-register participant in the GrantDisbursement SC
        // For Celo testnet this requires gas, wrapped in try/catch to not block API if failed
        try {
            const tx = await grantDisbursementContract.registerParticipant(address);
            await tx.wait();
        } catch (scError) {
            console.error("Smart contract registration failed:", scError);
            // Non-fatal for MVP wallet creation
        }

        return res.status(201).json({
            message: "Wallet created successfully",
            participant: data,
            privateKey: privateKey // MVP only! Remove in prod!
        });

    } catch (err) {
        console.error("Create Wallet Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

/**
 * Fetches a participant's data from Supabase by email.
 */
async function getParticipant(req, res) {
    try {
        const { email } = req.params;

        if (!email) {
            return res.status(400).json({ error: "Missing email parameter" });
        }

        const { data, error } = await supabase
            .from('participants')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: "Participant not found" });
        }

        return res.status(200).json(data);
    } catch (err) {
        console.error("Get Participant Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    createWallet,
    getParticipant
};
