import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://YOUR_RENDER_APP_NAME.onrender.com';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 40000,
});

// Attach JWT token from AsyncStorage on every request
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('cz_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize error messages
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: async (email: string, password: string) => {
    const { data } = await apiClient.post('/auth/register', { email, password });
    return data;
  },
  login: async (email: string, password: string) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    return data;
  },
  getMe: async () => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },
};

// ── Tasks ────────────────────────────────────────────────────────────────────
export const tasksApi = {
  getByDate: async (date: string): Promise<Task[]> => {
    const { data } = await apiClient.get(`/tasks/${date}`);
    return data.data;
  },
  getByRange: async (start: string, end: string): Promise<Task[]> => {
    const { data } = await apiClient.get(`/tasks/range?start=${start}&end=${end}`);
    return data.data;
  },
  create: async (payload: { title: string; date?: string }): Promise<Task> => {
    const { data } = await apiClient.post('/tasks', payload);
    return data.data;
  },
  toggle: async (id: string): Promise<{ task: Task; currentStreak: number; totalRating: number; totalTasksCompleted: number; totalTasksAssigned: number }> => {
    const { data } = await apiClient.patch(`/tasks/${id}`);
    return {
      task: data.data,
      currentStreak: data.currentStreak,
      totalRating: data.totalRating,
      totalTasksCompleted: data.totalTasksCompleted,
      totalTasksAssigned: data.totalTasksAssigned,
    };
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
  update: async (id: string, payload: { title: string; date: string }): Promise<Task> => {
    const { data } = await apiClient.put(`/tasks/${id}`, payload);
    return data.data;
  },
};

// ── Stats ────────────────────────────────────────────────────────────────────
export const statsApi = {
  getByDate: async (date: string): Promise<DailyStats> => {
    const { data } = await apiClient.get(`/stats/${date}`);
    return data.data;
  },
  getHistory: async (limit = 30) => {
    const { data } = await apiClient.get(`/stats/history?limit=${limit}`);
    return data.data;
  },
};

// ── Types ────────────────────────────────────────────────────────────────────
export interface Task {
  _id: string;
  userId: string;
  title: string;
  date: string;
  time?: string | null;
  isCompleted: boolean;
  createdAt: string;
}

export interface DailyStats {
  date: string;
  totalTasks: number;
  completedTasks: number;
  totalScore: number;
  achievedScore: number;
  bonusApplied: boolean;
}
