import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const createWallet = async (name, email) => {
    try {
        const response = await api.post('/create-wallet', { name, email });
        return response.data;
    } catch (error) {
        console.error('Error creating wallet:', error);
        throw error;
    }
};

export const verifyCredential = async (credentialId) => {
    try {
        const response = await api.get(`/verify-credential/${credentialId}`);
        return response.data;
    } catch (error) {
        console.error('Error verifying credential:', error);
        throw error;
    }
};

export const getParticipant = async (email) => {
    // This is a placeholder for a real auth / profile fetch
    try {
        const response = await api.get(`/participant/${email}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching participant:', error);
        throw error;
    }
}

export const getCredentialsByAddress = async (address) => {
    try {
        const response = await api.get(`/credentials/${address}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching credentials:', error);
        throw error;
    }
}

export const getGrants = async (participantId) => {
    try {
        const response = await api.get(`/grants/${participantId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching grants:', error);
        throw error;
    }
}

// Add more API helpers as needed for dashboard data
export default api;
