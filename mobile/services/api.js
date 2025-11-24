import axios from 'axios';
import { API_BASE_URL } from '../constants/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    console.log('Full URL:', config.baseURL + config.url);
    console.log('Request Data:', config.data);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error Details:');
    console.error('URL:', error.config?.baseURL + error.config?.url);
    console.error('Method:', error.config?.method);
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Full Error:', JSON.stringify(error, null, 2));
    
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - server took too long to respond');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('Cannot connect to server. Check if:');
      console.error('1. Rails server is running (rails server)');
      console.error('2. API_BASE_URL is correct:', API_BASE_URL);
      console.error('3. Server is binding to 0.0.0.0 (not just localhost)');
    }
    
    return Promise.reject(error);
  }
);

export const authService = {
  checkCpf: async (cpf) => {
    try {
      const response = await api.post('/auth/check_cpf', { cpf });
      return response.data;
    } catch (error) {
      // Re-throw with more context
      if (error.response) {
        // Server responded with error status
        throw error;
      } else if (error.request) {
        // Request was made but no response received
        throw new Error(`Network error: Unable to reach server at ${API_BASE_URL}. Make sure the Rails server is running.`);
      } else {
        // Something else happened
        throw new Error(`Request error: ${error.message}`);
      }
    }
  },
  
  login: async (cpf, password) => {
    const response = await api.post('/auth/login', { cpf, password });
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', {
      user: userData,
      password: userData.password,
    });
    return response.data;
  },
};

export const usersService = {
  listUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  
  getUser: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  updateWorker: async (id, userData, skillIds) => {
    const response = await api.put(`/users/${id}`, {
      user: userData,
      skill_ids: skillIds,
    });
    return response.data;
  },
  
  createWorker: async (userData, password, skillIds) => {
    const response = await api.post('/users/create_worker', {
      user: userData,
      password: password,
      skill_ids: skillIds,
    });
    return response.data;
  },
  
  getSkills: async () => {
    const response = await api.get('/users/skills/list');
    return response.data;
  },
};

export const profileService = {
  getProfile: async (cpf) => {
    const response = await api.get('/auth/profile', { params: { cpf } });
    return response.data;
  },
  
  updateProfile: async (cpf, userData) => {
    const response = await api.put('/auth/profile', {
      cpf: cpf,
      user: userData,
    });
    return response.data;
  },
};

export const tasksService = {
  getDashboard: async (cpf) => {
    const response = await api.get('/tasks/dashboard', { params: { cpf } });
    return response.data;
  },
  
  getMapData: async (cpf, filter = null) => {
    const params = { cpf };
    if (filter) {
      params.filter = filter;
    }
    const response = await api.get('/tasks/map_data', { params });
    return response.data;
  },
  
  createTaskRequest: async (cpf, taskRequestData) => {
    const response = await api.post('/tasks/task_requests', {
      cpf: cpf,
      task_request: taskRequestData,
    });
    return response.data;
  },
  
  getTaskDetails: async (type, id) => {
    const response = await api.get(`/tasks/${type}/${id}`);
    return response.data;
  },
  
  updateTaskStatus: async (cpf, taskId, status) => {
    const response = await api.put(`/tasks/${taskId}/status`, {
      cpf: cpf,
      status: status,
    });
    return response.data;
  },
  
  adminAction: async (cpf, itemId, actionType, workerId = null) => {
    const response = await api.post(`/tasks/${itemId}/admin_action`, {
      cpf: cpf,
      action_type: actionType,
      worker_id: workerId,
    });
    return response.data;
  },
};

export default api;

