import { useQuery } from '@tanstack/react-query';
import { AxiosInstance } from 'axios';

export interface Layout {
  logo: string;
  banner: string | null;
}

const DEFAULT_LAYOUT: Layout = {
  logo: 'https://ik.imagekit.io/johnchrismaina/Assets/sokonis_logo.svg',
  banner: null,
};

// fetch layout data from API
const fetchLayout = async (axiosInstance: AxiosInstance): Promise<Layout> => {
  try {
    const response = await axiosInstance.get('/api/get-layouts');
    return response.data.layout;
  } catch (error) {
    console.warn('Failed to fetch layout data, using defaults:', error);
    return DEFAULT_LAYOUT;
  }
};

export const useLayout = (axiosInstance: AxiosInstance) => {
  const {
    data: layout,
    isPending: isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['layout'],
    queryFn: () => fetchLayout(axiosInstance),
    staleTime: 0, // No caching - fetch on every mount
    gcTime: 0, // Don't persist in memory
    retry: 1,
  });

  return {
    layout: layout || DEFAULT_LAYOUT,
    isLoading,
    isError,
    refetch,
  };
};

export default useLayout;
