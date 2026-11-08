import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePasscodeStore } from '@/store/passcodeStore';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://chronos-zenith-api.onrender.com';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 40000,
});

// Attach passcode from memory or AsyncStorage on every request
apiClient.interceptors.request.use(async (config) => {
  let passcode = usePasscodeStore.getState().passcode;
  if (!passcode) {
    passcode = await AsyncStorage.getItem('cz_passcode');
  }
  if (passcode) config.headers['x-passcode'] = passcode;
  return config;
});

// Normalize errors; clear passcode on 401 so the unlock screen shows again
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await usePasscodeStore.getState().clearPasscode();
    }
    const message = error.response?.data?.message || error.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

// ── Owner profile ────────────────────────────────────────────────────────────
export const ownerApi = {
  getMe: async () => {
    const { data } = await apiClient.get('/me');
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
  userId?: string;
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
