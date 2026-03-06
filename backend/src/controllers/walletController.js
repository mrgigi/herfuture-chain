const { ethers } = require('ethers');
const supabase = require('../services/supabaseService');
const { grantDisbursementContract } = require('../services/blockchainService');

/**
 * Creates a participant wallet and decentralized identifier (DID), 
 * stores them in Supabase, and optionally registers them in GrantDisbursement.
 */
async function createWallet(req, res) {
    try {
        const { first_name, last_name, phone } = req.body;

        if (!first_name || !last_name || !phone) {
            return res.status(400).json({ error: "First name, last name, and phone number are required" });
        }

        // 1. Generate random wallet using ethers.js
        const wallet = ethers.Wallet.createRandom();
        const address = wallet.address;
        const privateKey = wallet.privateKey;

        // 2. DID creation (decentralized identity)
        const did = `did:celo:${address}`;

        // 3. Save to Supabase Participants table
        const { data, error } = await supabase
            .from('participants')
            .insert([{
                first_name,
                last_name,
                phone,
                wallet_address: address,
                did
            }])
            .select('*')
            .single();

        if (error) {
            console.error("Supabase insert error:", error);
            if (error.code === '23505') {
                return res.status(409).json({ error: "Participant with this phone number already exists" });
            }
            throw new Error("Failed to insert into Supabase");
        }

        // 4. Optionally: Pre-register participant in the GrantDisbursement SC
        try {
            const tx = await grantDisbursementContract.registerParticipant(address);
            await tx.wait();
        } catch (scError) {
            console.error("Smart contract registration failed:", scError);
        }

        return res.status(201).json({
            message: "Decentralized identity created successfully",
            participant: data,
            privateKey: privateKey // MVP only!
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
        const { phone } = req.params;

        if (!phone) {
            return res.status(400).json({ error: "Missing phone parameter" });
        }

        const { data, error } = await supabase
            .from('participants')
            .select('*')
            .eq('phone', phone)
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
