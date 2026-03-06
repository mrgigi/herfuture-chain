import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config({ path: "./backend/.env" });

/** @type import('hardhat/config').HardhatUserConfig */
export default {
    solidity: "0.8.19",
    networks: {
        sepolia: {
            url: process.env.CELO_RPC_URL || "https://forno.celo-sepolia.celo-testnet.org",
            accounts: process.env.ADMIN_PRIVATE_KEY ? [process.env.ADMIN_PRIVATE_KEY] : [],
            chainId: 11142220
        }
    }
};
