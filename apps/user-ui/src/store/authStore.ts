import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = {
  id?: string;
  name?: string;
  email?: string;
};

type AuthState = {
  isLoggedIn: boolean;
  user: User | null;
  hasHydrated: boolean;
  setLoggedIn: (value: boolean) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      hasHydrated: false,
      setLoggedIn: (value) => set({ isLoggedIn: value }),
      setUser: (user) => set({ user, isLoggedIn: !!user }),
      logout: () => set({ isLoggedIn: false, user: null }),
      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
