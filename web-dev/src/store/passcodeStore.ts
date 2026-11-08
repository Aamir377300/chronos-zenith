import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  _hasHydrated: boolean;
  setPasscode: (passcode: string) => void;
  setUser: (user: OwnerProfile) => void;
  updateUser: (user: Partial<OwnerProfile>) => void;
  clearPasscode: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const usePasscodeStore = create<PasscodeState>()(
  persist(
    (set) => ({
      passcode: null,
      user: null,
      _hasHydrated: false,
      setPasscode: (passcode) => set({ passcode }),
      setUser: (user) => set({ user }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
      clearPasscode: () => set({ passcode: null, user: null }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'cz-passcode',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ passcode: state.passcode, user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
