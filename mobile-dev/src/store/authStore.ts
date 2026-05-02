import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthUser {
  id: string;
  email: string;
  currentStreak: number;
  totalRating: number;
  totalTasksCompleted: number;
  totalTasksAssigned: number;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  setAuth: (token: string, user: AuthUser) => Promise<void>;
  updateUser: (user: Partial<AuthUser>) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isLoading: true,

  setAuth: async (token, user) => {
    await AsyncStorage.setItem('cz_token', token);
    await AsyncStorage.setItem('cz_user', JSON.stringify(user));
    set({ token, user });
  },

  updateUser: async (userData) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      await AsyncStorage.setItem('cz_user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    }
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['cz_token', 'cz_user']);
    set({ token: null, user: null });
  },

  loadFromStorage: async () => {
    try {
      const [token, userStr] = await AsyncStorage.multiGet(['cz_token', 'cz_user']);
      const tokenVal = token[1];
      const userVal = userStr[1] ? JSON.parse(userStr[1]) : null;
      set({ token: tokenVal, user: userVal });
    } catch {
      // ignore storage errors
    } finally {
      set({ isLoading: false });
    }
  },
}));
