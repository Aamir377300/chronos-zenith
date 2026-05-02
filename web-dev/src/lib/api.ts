import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token from Zustand persisted store on every request
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('cz-auth');
      if (stored) {
        const { state } = JSON.parse(stored);
        if (state?.token) config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch {
      // ignore parse errors
    }
  }
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
