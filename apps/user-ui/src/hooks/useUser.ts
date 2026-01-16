import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';
import { useAuthStore } from '../store/authStore';
import { isProtected } from '../utils/protected';

// Fetch user data from API
const fetchUser = async (isLoggedIn: boolean) => {
  if (!isLoggedIn) return null; // don’t call API if not logged in

  // const config = isLoggedIn ? isProtected : {};
  const config = isProtected; // safe to assume we want protected headers
  const response = await axiosInstance.get('/api/logged-in-user', config);

  // Ensure we never return undefined
  return response.data?.user ?? null;
  // return response.data.user;
};

const useUser = () => {
  const { setLoggedIn, isLoggedIn } = useAuthStore();

  const {
    data: user,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['user'],
    queryFn: () => fetchUser(isLoggedIn),
    enabled: isLoggedIn, // only run when logged in
    staleTime: 1000 * 60 * 5,
    retry: false,
    // @ts-ignore
    onSuccess: () => {
      setLoggedIn(true);
    },
    onError: () => {
      setLoggedIn(false);
    },
  });

  return { user: user as any, isLoading: isPending, isError };
};

export default useUser;
