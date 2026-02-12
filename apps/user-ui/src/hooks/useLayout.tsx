import axiosInstance from '../utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';

// fetch layout data from API
const fetchLayout = async () => {
  try {
    const response = await axiosInstance.get('/api/get-layouts');
    return response.data.layout;
  } catch (error) {
    console.warn('Failed to fetch layout data, using defaults:', error);
    // Return default layout on error
    return {
      logo: 'https://ik.imagekit.io/johnchrismaina/Assets/logo.svg?updatedAt=1770627783400',
      banner: null,
    };
  }
};

const useLayout = () => {
  const {
    data: layout,
    isPending: isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['layout'],
    queryFn: fetchLayout,
    staleTime: 0, // No caching - fetch on every mount
    gcTime: 0, // Don't persist in memory
    retry: 1,
  });

  return {
    layout: layout || {
      logo: 'https://ik.imagekit.io/johnchrismaina/Assets/logo.svg',
      banner: null,
    },
    isLoading,
    isError,
    refetch,
  };
};

export default useLayout;
