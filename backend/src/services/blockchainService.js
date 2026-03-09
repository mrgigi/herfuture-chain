const { ethers } = require('ethers');
require('dotenv').config();

const provider = new ethers.JsonRpcProvider(process.env.CELO_RPC_URL);
const adminWallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000000', provider);

const credentialRegistryAddress = process.env.CREDENTIAL_REGISTRY_ADDRESS;
const grantDisbursementAddress = process.env.GRANT_DISBURSEMENT_ADDRESS;

// Minimal ABIs needed for interactions
const credentialRegistryAbi = [
    "function issueCredential(address participant, string credentialType, string ipfsHash) public",
    "function getCredentials(address participant) public view returns (tuple(uint256 credentialId, address participant, string credentialType, string ipfsHash, uint256 timestamp)[])",
    "function getCredential(uint256 credentialId) public view returns (tuple(uint256 credentialId, address participant, string credentialType, string ipfsHash, uint256 timestamp))",
    "function verifyCredential(uint256 credentialId) public view returns (bool)"
];

const grantDisbursementAbi = [
    "function registerParticipant(address participant) external",
    "function setMilestoneGrant(string memory milestoneName, uint256 grantAmount) external",
    "function completeMilestone(address participant, string milestoneName) external",
    "function releaseGrant(address participant) external"
];

const credentialRegistryContract = new ethers.Contract(
    credentialRegistryAddress,
    credentialRegistryAbi,
    adminWallet
);

const grantDisbursementContract = new ethers.Contract(
    grantDisbursementAddress,
    grantDisbursementAbi,
    adminWallet
);

module.exports = {
    provider,
    adminWallet,
    credentialRegistryContract,
    grantDisbursementContract
};
