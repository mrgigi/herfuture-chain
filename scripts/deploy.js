import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // 1. Deploy CredentialRegistry
    console.log("Deploying CredentialRegistry...");
    const CredentialRegistry = await hre.ethers.getContractFactory("CredentialRegistry");
    const credentialRegistry = await CredentialRegistry.deploy();
    await credentialRegistry.waitForDeployment();
    const credentialRegistryAddress = await credentialRegistry.getAddress();
    console.log(`CredentialRegistry deployed to: ${credentialRegistryAddress}`);

    // 2. Deploy GrantDisbursement
    console.log("Deploying GrantDisbursement...");
    const cUsdAddressSepolia = "0x954cBA141f21760751E3065ACC250c38fb9f5e61"; // Official Sepolia cUSD token

    const GrantDisbursement = await hre.ethers.getContractFactory("GrantDisbursement");
    const grantDisbursement = await GrantDisbursement.deploy(cUsdAddressSepolia);
    await grantDisbursement.waitForDeployment();
    const grantDisbursementAddress = await grantDisbursement.getAddress();
    console.log(`GrantDisbursement deployed to: ${grantDisbursementAddress}`);

    // 3. Update backend/.env file with the newly deployed addresses automatically
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

        fs.writeFileSync(envPath, envContent);
        console.log("✅ Updated backend/.env file with the deployed contract addresses.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
