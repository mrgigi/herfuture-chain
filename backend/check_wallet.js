const { ethers } = require('ethers');
require('dotenv').config({ path: '.env' });

const ADMIN_PK = process.env.ADMIN_PRIVATE_KEY;
const wallet = new ethers.Wallet(ADMIN_PK);
console.log("Admin Wallet Public Address:", wallet.address);
