const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', chain: 'celo-alfajores' });
});

// Main API Router Mounting
app.use('/api', apiRoutes);

// General Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled Application Error:", err);
    if (err.stack) console.error(err.stack);

    if (err.type === 'entity.too.large') {
        return res.status(413).json({ error: 'Payload too large. Please use a smaller image.' });
    }

    res.status(500).json({ error: 'Something went terribly wrong!' });
});

process.on('uncaughtException', (err) => {
    console.error('URGENT: Uncaught Exception:', err);
    if (err.stack) console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('URGENT: Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the Web Server
app.listen(PORT, () => {
    console.log(`🚀 HerFuture Chain backend running on port ${PORT}`);
    console.log(`Webhooks actively listening at http://localhost:${PORT}/api/module-complete`);
});
