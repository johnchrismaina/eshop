import axios from 'axios';

const axiosProductService = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URI || 'http://localhost:6002',
  withCredentials: true,
});

export default axiosProductService;
