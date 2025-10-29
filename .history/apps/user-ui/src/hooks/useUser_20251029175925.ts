import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

// Fetch ser data from API
const fetchUser = async () => {
  const response = await axiosInstance.get('/api/logged-in-user');
};
