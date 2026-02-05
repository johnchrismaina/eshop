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
  const { setLoggedIn, isLoggedIn } = useAuthStore();

  const { data, isPending, isError, isSuccess } = useQuery<
    SessionResponse,
    Error
  >({
    queryKey: ['user'],
    queryFn: () => fetchUser(isLoggedIn),
    enabled: isLoggedIn,
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
    gcTime: 1000 * 60 * 30, // garbage collect after 30 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: false,
  });

  // ✅ useEffect is the correct place to update external store
  useEffect(() => {
    if (isSuccess) {
      setLoggedIn(true);
    }
    if (isError) {
      setLoggedIn(false);
    }
  }, [isSuccess, isError, setLoggedIn]);

  return {
    user: data?.user ?? null,
    role: data?.role ?? 'guest',
    isLoading: isPending,
    isError,
  };
};

export default useUser;
