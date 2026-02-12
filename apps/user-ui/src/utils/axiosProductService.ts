import axios from 'axios';

const axiosProductService = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URI ||
    process.env.NEXT_PUBLIC_SERVER_URI ||
    'http://localhost:8080',
  withCredentials: true,
});

export default axiosProductService;
