import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';
import { useAuthStore } from '../store/authStore';
import { isProtected } from '../utils/protected';
import { useEffect } from 'react';

interface SessionResponse {
  role: 'guest' | 'user' | 'seller' | 'admin';
  user: any | null; // replace `any` with your actual User type
}

const fetchUser = async (isLoggedIn: boolean): Promise<SessionResponse> => {
  if (!isLoggedIn) {
    return { role: 'guest', user: null };
  }

  const config = isProtected;
  const response = await axiosInstance.get('/api/logged-in-user', config);

  return {
    role: response.data?.role ?? 'guest',
    user: response.data?.user ?? null,
  };
};

const useUser = () => {
  const {
    setLoggedIn,
    setUser,
    isLoggedIn,
    user: cachedUser,
    hasHydrated,
  } = useAuthStore();

  const { data, isPending, isError, isSuccess } = useQuery<
    SessionResponse,
    Error
  >({
    queryKey: ['user'],
    queryFn: () => fetchUser(isLoggedIn),
    enabled: isLoggedIn && hasHydrated,
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
    gcTime: 1000 * 60 * 30, // garbage collect after 30 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: false,
  });

  // ✅ useEffect is the correct place to update external store
  useEffect(() => {
    if (isSuccess && data?.user) {
      setLoggedIn(true);
      setUser(data.user);
    }
    if (isError) {
      setLoggedIn(false);
      setUser(null);
    }
  }, [isSuccess, isError, data?.user, setLoggedIn, setUser]);

  // If not hydrated yet, show loading state
  if (!hasHydrated) {
    return {
      user: null,
      role: 'guest' as const,
      isLoading: true,
      isError: false,
    };
  }

  // If not logged in, return guest state
  if (!isLoggedIn) {
    return {
      user: null,
      role: 'guest' as const,
      isLoading: false,
      isError: false,
    };
  }

  return {
    user: data?.user ?? cachedUser ?? null,
    role: data?.role ?? (cachedUser ? 'user' : 'guest'),
    isLoading: isPending && !cachedUser,
    isError,
  };
};

export default useUser;
