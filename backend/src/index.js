const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', chain: 'celo-alfajores' });
});

// Main API Router Mounting
app.use('/api', apiRoutes);

// General Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled Application Error:", err.stack);
    res.status(500).json({ error: 'Something went terribly wrong!' });
});

// Start the Web Server
app.listen(PORT, () => {
    console.log(`🚀 HerFuture Chain backend running on port ${PORT}`);
    console.log(`Webhooks actively listening at http://localhost:${PORT}/api/module-complete`);
});
