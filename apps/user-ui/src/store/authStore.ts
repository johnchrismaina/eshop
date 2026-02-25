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
  hydrated: boolean;
  isLoading: boolean;
  setLoggedIn: (value: boolean) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  setLoading: (value: boolean) => void;
  setHydrated: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null, // Always start null - Zustand persist will hydrate from localStorage
      hydrated: false,
      isLoading: false,
      setLoggedIn: (value) => set({ isLoggedIn: value }),
      setUser: (user) => set({ user, isLoggedIn: !!user }),
      logout: () => {
        localStorage.removeItem('auth-storage');
        set({ isLoggedIn: false, user: null });
      },
      setLoading: (value) => set({ isLoading: value }),
      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

// Helper to check if user was previously logged in (for showing skeleton vs "Log in")
export const hadPreviousSession = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return !!parsed.state?.user;
    }
  } catch {
    // ignore
  }
  return false;
};
