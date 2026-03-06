import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // 1. Deploy MockcUSD (To Unblock Testing)
    console.log("Deploying MockcUSD...");
    const MockcUSD = await hre.ethers.getContractFactory("MockcUSD");
    const mockcUSD = await MockcUSD.deploy();
    await mockcUSD.waitForDeployment();
    const mockcUSDAddress = await mockcUSD.getAddress();
    console.log(`MockcUSD deployed to: ${mockcUSDAddress}`);

    // 2. Deploy CredentialRegistry
    console.log("Deploying CredentialRegistry...");
    const CredentialRegistry = await hre.ethers.getContractFactory("CredentialRegistry");
    const credentialRegistry = await CredentialRegistry.deploy();
    await credentialRegistry.waitForDeployment();
    const credentialRegistryAddress = await credentialRegistry.getAddress();
    console.log(`CredentialRegistry deployed to: ${credentialRegistryAddress}`);

    // 3. Deploy GrantDisbursement
    console.log("Deploying GrantDisbursement...");
    const GrantDisbursement = await hre.ethers.getContractFactory("GrantDisbursement");
    const grantDisbursement = await GrantDisbursement.deploy(mockcUSDAddress);
    await grantDisbursement.waitForDeployment();
    const grantDisbursementAddress = await grantDisbursement.getAddress();
    console.log(`GrantDisbursement deployed to: ${grantDisbursementAddress}`);

    // 4. Fund the Contract!
    const fundingAmount = hre.ethers.parseEther("10000"); // 10k mock cUSD
    console.log(`Funding GrantDisbursement with ${hre.ethers.formatEther(fundingAmount)} mock cUSD...`);
    const tx = await mockcUSD.transfer(grantDisbursementAddress, fundingAmount);
    await tx.wait();
    console.log("✅ Contract funded!");

    // 5. Update backend/.env file with the newly deployed addresses automatically
    const envPath = path.join(__dirname, '../backend/.env');
    if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf8');

        envContent = envContent.replace(
            /CREDENTIAL_REGISTRY_ADDRESS=.*$/m,
            `CREDENTIAL_REGISTRY_ADDRESS=${credentialRegistryAddress}`
        );

        envContent = envContent.replace(
            /GRANT_DISBURSEMENT_ADDRESS=.*$/m,
            `GRANT_DISBURSEMENT_ADDRESS=${grantDisbursementAddress}`
        );

        // Add or update MOCK_CUSD_ADDRESS if needed
        if (envContent.includes('MOCK_CUSD_ADDRESS=')) {
            envContent = envContent.replace(/MOCK_CUSD_ADDRESS=.*$/m, `MOCK_CUSD_ADDRESS=${mockcUSDAddress}`);
        } else {
            envContent += `\nMOCK_CUSD_ADDRESS=${mockcUSDAddress}\n`;
        }

        fs.writeFileSync(envPath, envContent);
        console.log("✅ Updated backend/.env file with the deployed contract addresses.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
