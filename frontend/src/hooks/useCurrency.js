import { useState, useEffect } from 'react';
import { getExchangeRate } from '../lib/api';

/**
 * Custom hook to manage currency conversion from cUSD to Naira.
 */
export function useCurrency() {
    const [rate, setRate] = useState(1600); // Default fallback
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRate = async () => {
            try {
                const data = await getExchangeRate();
                if (data && data.USD_NGN) {
                    setRate(data.USD_NGN);
                }
            } catch (error) {
                console.error('Failed to fetch exchange rate for hook:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRate();
    }, []);

    /**
     * Converts cUSD amount to Naira.
     * @param {number} cusd - Amount in cUSD
     * @returns {number} - Amount in Naira
     */
    const toNaira = (cusd) => {
        return Math.floor(cusd * rate);
    };

    /**
     * Formats a number as Naira currency.
     * @param {number} amount - Amount in Naira
     * @returns {string} - Formatted string (e.g., ₦48,000)
     */
    const formatNaira = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    /**
     * Formats a number as USD/cUSD currency.
     * @param {number} amount - Amount in USD
     * @returns {string} - Formatted string (e.g., $30.00)
     */
    const formatCUSD = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    return {
        rate,
        loading,
        toNaira,
        formatNaira,
        formatCUSD
    };
}
