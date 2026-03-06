import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const createWallet = async (firstName, lastName, phone) => {
    try {
        const response = await api.post('/create-wallet', { first_name: firstName, last_name: lastName, phone });
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

export const getParticipant = async (phone) => {
    try {
        const response = await api.get(`/participant/${phone}`);
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
    const response = await api.get(`/grants/${participantId}`);
    return response.data;
};

// --- LMS Functions ---

export const getCourses = async () => {
    const response = await api.get('/courses');
    return response.data;
};

export const getModules = async (courseId, participantId) => {
    const response = await api.get(`/courses/${courseId}/modules`, { params: { participantId } });
    return response.data;
};

export const getLesson = async (lessonId) => {
    const response = await api.get(`/lessons/${lessonId}`);
    return response.data;
};

export const getQuiz = async (lessonId) => {
    const response = await api.get(`/lessons/${lessonId}/quiz`);
    return response.data;
};

export const submitLessonProgress = async (participantId, lessonId, score) => {
    const response = await api.post('/complete-lesson', { participantId, lessonId, score });
    return response.data;
};

export const getProgressOverview = async (participantId) => {
    const response = await api.get(`/progress-overview/${participantId}`);
    return response.data;
};

// --- Admin & System Functions ---

export const getAdminParticipants = async (page = 1, limit = 20) => {
    const response = await api.get('/admin/participants', { params: { page, limit } });
    return response.data;
};

export const updateCourseStatus = async (courseId, isPublished) => {
    const response = await api.post('/admin/course-status', { courseId, isPublished });
    return response.data;
};

export const getSystemSettings = async () => {
    const response = await api.get('/admin/settings');
    return response.data;
};

export const updateSystemSetting = async (key, value) => {
    const response = await api.post('/admin/settings', { key, value });
    return response.data;
};

// Add more API helpers as needed for dashboard data
export default api;
