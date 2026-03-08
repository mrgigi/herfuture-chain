import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 404 && error.config.url.startsWith('/participant/')) {
            localStorage.removeItem('userPhone');
            localStorage.removeItem('userAvatar');
            if (window.location.pathname !== '/signup' && window.location.pathname !== '/' && window.location.pathname !== '/gate') {
                window.location.href = '/signup';
            }
        }
        return Promise.reject(error);
    }
);

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
        const response = await api.get(`/participant/${encodeURIComponent(phone)}`);
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

export const updateCourseDetails = async (courseId, data) => {
    const response = await api.post(`/admin/courses/${courseId}`, data);
    return response.data;
};

export const updateModule = async (moduleId, data) => {
    const response = await api.post(`/admin/modules/${moduleId}`, data);
    return response.data;
};

export const updateLesson = async (lessonId, data) => {
    const response = await api.post(`/admin/lessons/${lessonId}`, data);
    return response.data;
};

export const createCourse = async (data) => {
    const response = await api.post('/admin/courses', data);
    return response.data;
};

export const deleteCourse = async (courseId) => {
    const response = await api.delete(`/admin/courses/${courseId}`);
    return response.data;
};

export const createModule = async (data) => {
    const response = await api.post('/admin/modules', data);
    return response.data;
};

export const deleteModule = async (moduleId) => {
    const response = await api.delete(`/admin/modules/${moduleId}`);
    return response.data;
};

export const generateQuizAI = async (data) => {
    const response = await api.post('/ai/generate-quiz', data);
    return response.data;
};

export const saveQuiz = async (lessonId, data) => {
    const response = await api.post(`/lessons/${lessonId}/quiz`, { data });
    return response.data;
};

export const createLesson = async (data) => {
    const response = await api.post('/admin/lessons', data);
    return response.data;
};

export const deleteLesson = async (lessonId) => {
    const response = await api.delete(`/admin/lessons/${lessonId}`);
    return response.data;
};

export const deleteParticipant = async (participantId) => {
    const response = await api.delete(`/admin/participants/${participantId}`);
    return response.data;
};

export const getExchangeRate = async () => {
    const response = await api.get('/exchange-rate');
    return response.data;
};

export default api;
