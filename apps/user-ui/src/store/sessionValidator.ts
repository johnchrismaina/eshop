import axiosInstance from '../utils/axiosInstance';
import { useAuthStore } from './authStore';

export async function validateSession() {
  const { setLoading, setUser } = useAuthStore.getState();

  try {
    setLoading(true);

    // Call your backend session endpoint
    const response = await axiosInstance.get('/api/session');
    const { user } = response.data;

    if (user) {
      // Persist user into Zustand + localStorage
      setUser(user);
    } else {
      setUser(null);
    }
  } catch (err) {
    console.error('Session validation error:', err);
    setUser(null);
  } finally {
    setLoading(false);
  }
}
