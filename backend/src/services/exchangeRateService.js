const axios = require('axios');

/**
 * Service to handle USD to NGN exchange rate fetching and caching.
 * Uses ExchangeRate-API (Free Tier allows 1,500 requests/month).
 */

let cachedRate = 1600; // Realistic fallback for Nigeria
let lastFetchTime = 0;
const CACHE_TTL = 3600000; // 1 hour in milliseconds

async function getExchangeRate() {
    const now = Date.now();

    // Return cached rate if still valid
    if (now - lastFetchTime < CACHE_TTL) {
        return cachedRate;
    }

    try {
        console.log('Fetching fresh USD/NGN exchange rate...');
        // Using ExchangeRate-API (Standard Free Endpoint)
        // Note: In production, consider moving the API key to .env
        const response = await axios.get('https://open.er-api.com/v6/latest/USD');

        if (response.data && response.data.rates && response.data.rates.NGN) {
            cachedRate = response.data.rates.NGN;
            lastFetchTime = now;
            console.log(`Updated exchange rate: 1 USD = ${cachedRate} NGN`);
        }
    } catch (error) {
        console.error('Error fetching exchange rate:', error.message);
        // Fallback to previous cached rate or hardcoded default
    }

    return cachedRate;
}

module.exports = {
    getExchangeRate
};
