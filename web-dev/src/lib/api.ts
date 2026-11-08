import axios from 'axios';
import { usePasscodeStore } from '@/store/passcodeStore';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 40000,
});

// Attach passcode from in-memory store (falls back to localStorage)
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    let passcode = usePasscodeStore.getState().passcode;
    if (!passcode) {
      try {
        const stored = localStorage.getItem('cz-passcode');
        if (stored) passcode = JSON.parse(stored)?.state?.passcode ?? null;
      } catch {
        // ignore parse errors
      }
    }
    if (passcode) config.headers['x-passcode'] = passcode;
  }
  return config;
});

// Normalize errors; clear passcode on 401 so the gate shows again
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      usePasscodeStore.getState().clearPasscode();
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
  getByDate: async (date: string) => {
    const { data } = await apiClient.get(`/tasks/${date}`);
    return data.data as Task[];
  },
  getByRange: async (start: string, end: string) => {
    const { data } = await apiClient.get(`/tasks/range?start=${start}&end=${end}`);
    return data.data as Task[];
  },
  create: async (payload: { title: string; date?: string }) => {
    const { data } = await apiClient.post('/tasks', payload);
    return data.data as Task;
  },
  createSet: async (payload: { titles: string[]; dates: string[] }) => {
    const { data } = await apiClient.post('/tasks/set', payload);
    return data.created as number;
  },
  toggle: async (id: string) => {
    const { data } = await apiClient.patch(`/tasks/${id}`);
    return {
      task: data.data as Task,
      currentStreak: data.currentStreak as number,
      totalRating: data.totalRating as number,
      totalTasksCompleted: data.totalTasksCompleted as number,
      totalTasksAssigned: data.totalTasksAssigned as number,
    };
  },
  delete: async (id: string) => {
    await apiClient.delete(`/tasks/${id}`);
  },
  update: async (id: string, payload: { title: string; date: string }) => {
    const { data } = await apiClient.put(`/tasks/${id}`, payload);
    return data.data as Task;
  },
};

// ── Stats ────────────────────────────────────────────────────────────────────
export const statsApi = {
  getByDate: async (date: string) => {
    const { data } = await apiClient.get(`/stats/${date}`);
    return data.data as DailyStats;
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
