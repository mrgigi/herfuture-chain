const axios = require('axios');
require('dotenv').config();

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;

/**
 * Upload JSON metadata to IPFS via Pinata
 * @param {Object} metadata - The credential metadata object
 * @returns {Promise<string>} IPFS hash (CID)
 */
async function uploadToIPFS(metadata) {
    try {
        const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

        const response = await axios.post(
            url,
            metadata,
            {
                headers: {
                    'Content-Type': 'application/json',
                    pinata_api_key: pinataApiKey,
                    pinata_secret_api_key: pinataSecretApiKey
                }
            }
        );

        return response.data.IpfsHash;
    } catch (error) {
        console.error("Error uploading to IPFS:", error);
        throw new Error("Failed to upload credential metadata to IPFS");
    }
}

module.exports = {
    uploadToIPFS
};
