import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OwnerProfile {
  id: string;
  currentStreak: number;
  totalRating: number;
  totalTasksCompleted: number;
  totalTasksAssigned: number;
}

interface PasscodeState {
  passcode: string | null;
  user: OwnerProfile | null;
  isLoading: boolean;
  setPasscode: (passcode: string) => Promise<void>;
  setUser: (user: OwnerProfile) => Promise<void>;
  updateUser: (user: Partial<OwnerProfile>) => Promise<void>;
  clearPasscode: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

export const usePasscodeStore = create<PasscodeState>((set, get) => ({
  passcode: null,
  user: null,
  isLoading: true,

  setPasscode: async (passcode) => {
    await AsyncStorage.setItem('cz_passcode', passcode);
    set({ passcode });
  },

  setUser: async (user) => {
    await AsyncStorage.setItem('cz_user', JSON.stringify(user));
    set({ user });
  },

  updateUser: async (userData) => {
    const currentUser = get().user;
    const updatedUser: OwnerProfile = {
      id: currentUser?.id ?? '',
      currentStreak: currentUser?.currentStreak ?? 0,
      totalRating: currentUser?.totalRating ?? 0,
      totalTasksCompleted: currentUser?.totalTasksCompleted ?? 0,
      totalTasksAssigned: currentUser?.totalTasksAssigned ?? 0,
      ...userData,
    };
    await AsyncStorage.setItem('cz_user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  clearPasscode: async () => {
    await AsyncStorage.multiRemove(['cz_passcode', 'cz_user']);
    set({ passcode: null, user: null });
  },

  loadFromStorage: async () => {
    try {
      const [[, passcode], [, userStr]] = await AsyncStorage.multiGet([
        'cz_passcode',
        'cz_user',
      ]);
      const userVal = userStr ? JSON.parse(userStr) : null;
      set({ passcode: passcode ?? null, user: userVal });
    } catch {
      // ignore storage errors
    } finally {
      set({ isLoading: false });
    }
  },
}));
