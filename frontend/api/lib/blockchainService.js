import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(process.env.CELO_RPC_URL);
const adminWallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000000', provider);

const credentialRegistryAddress = process.env.CREDENTIAL_REGISTRY_ADDRESS;
const grantDisbursementAddress = process.env.GRANT_DISBURSEMENT_ADDRESS;
const cUSDAddress = process.env.MOCK_CUSD_ADDRESS || "0x18871DD3fb8F301809294069E791397b2F002cBb";

const erc20Abi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)"
];

const credentialRegistryAbi = [
    "function issueCredential(address participant, string credentialType, string ipfsHash) public",
    "function getCredentials(address participant) public view returns (tuple(uint256 credentialId, address participant, string credentialType, string ipfsHash, uint256 timestamp)[])",
    "function verifyCredential(uint256 credentialId) public view returns (bool)"
];

const grantDisbursementAbi = [
    "function registerParticipant(address participant) external",
    "function setMilestoneGrant(string memory milestoneName, uint256 grantAmount) external",
    "function completeMilestone(address participant, string milestoneName) external",
    "function releaseGrant(address participant) external"
];

export const credentialRegistryContract = new ethers.Contract(
    credentialRegistryAddress || ethers.ZeroAddress,
    credentialRegistryAbi,
    adminWallet
);

export const grantDisbursementContract = new ethers.Contract(
    grantDisbursementAddress || ethers.ZeroAddress,
    grantDisbursementAbi,
    adminWallet
);

export const cUSDContract = new ethers.Contract(
    cUSDAddress,
    erc20Abi,
    provider
);

export { provider, adminWallet, grantDisbursementAddress };
