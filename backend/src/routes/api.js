const express = require('express');
const router = express.Router();

const { createWallet, getParticipant } = require('../controllers/walletController');
const { moduleCompleteWebhook } = require('../controllers/moduleController');
const { issueCredential, verifyCredential, getCredentialsByAddress } = require('../controllers/credentialController');
const { releaseGrant, getGrants } = require('../controllers/grantController');

// Define API Endpoints

// 1. Participant Routes
router.post('/create-wallet', createWallet);
router.get('/participant/:email', getParticipant);

// 2. Webhooks
router.post('/module-complete', moduleCompleteWebhook);

// 3. Credential Routes
router.post('/issue-credential', issueCredential);
router.get('/verify-credential/:credentialId', verifyCredential);
router.get('/credentials/:address', getCredentialsByAddress);

// 4. Grant Routes
router.post('/release-grant', releaseGrant);
router.get('/grants/:participantId', getGrants);

module.exports = router;
