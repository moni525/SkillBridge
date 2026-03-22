// skillbridge/src/services/api.js

const API_BASE_URL = 'http://127.0.0.1:5000';

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const api = {
    // Auth
    login: async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return response.json();
    },

    register: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return response.json();
    },

    getMe: async () => {
        const response = await fetch(`${API_BASE_URL}/me`, {
            headers: getAuthHeaders()
        });
        return response.json();
    },

    // Resources Base
    getEvents: async () => {
        const response = await fetch(`${API_BASE_URL}/events`);
        return response.json();
    },

    getMentors: async () => {
        const response = await fetch(`${API_BASE_URL}/mentors`);
        return response.json();
    },

    getResources: async () => {
        const response = await fetch(`${API_BASE_URL}/resources`);
        return response.json();
    },

    // Protected Routes
    getDashboardData: async () => {
        const response = await fetch(`${API_BASE_URL}/dashboard-data`, {
            headers: getAuthHeaders()
        });
        return response.json();
    },

    requestMentorship: async (mentorId, message) => {
        const response = await fetch(`${API_BASE_URL}/mentor-requests`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ mentor_id: mentorId, message })
        });
        return response.json();
    },

    bookResource: async (resourceId) => {
        const response = await fetch(`${API_BASE_URL}/book-resource`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ resource_id: resourceId })
        });
        return response.json();
    },

    saveProject: async (projectData) => {
        const response = await fetch(`${API_BASE_URL}/projects`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(projectData)
        });
        return response.json();
    },

    getMyProjects: async () => {
        const response = await fetch(`${API_BASE_URL}/my-projects`, {
            headers: getAuthHeaders()
        });
        return response.json();
    },

    chat: async (message) => {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        return response.json();
    },

    generateSkillPath: async (pathData) => {
        const response = await fetch(`${API_BASE_URL}/skill-path`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(pathData)
        });
        return response.json();
    },

    getMySkillPaths: async () => {
        const response = await fetch(`${API_BASE_URL}/skill-paths`, {
            headers: getAuthHeaders()
        });
        return response.json();
    },

    searchBooks: async (query) => {
        const response = await fetch(`${API_BASE_URL}/books/search?q=${encodeURIComponent(query)}`);
        return response.json();
    },

    reserveBook: async (copyId) => {
        const response = await fetch(`${API_BASE_URL}/books/reserve`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ copy_id: copyId })
        });
        return response.json();
    },

    notifyBookAvailability: async (bookId) => {
        const response = await fetch(`${API_BASE_URL}/books/notify`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ book_id: bookId })
        });
        return response.json();
    },

    getActiveSkillPath: async () => {
        const response = await fetch(`${API_BASE_URL}/skill-paths/active`, {
            headers: getAuthHeaders()
        });
        return response.json();
    },

    updateSkillTasks: async (completedIds, pendingIds) => {
        const response = await fetch(`${API_BASE_URL}/skill-paths/update-tasks`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ completed_task_ids: completedIds, pending_task_ids: pendingIds })
        });
        return response.json();
    },

    requestEasierPath: async (pathId) => {
        const response = await fetch(`${API_BASE_URL}/skill-paths/easier`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ path_id: pathId })
        });
        return response.json();
    }
};
