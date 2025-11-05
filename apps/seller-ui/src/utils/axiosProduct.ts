import axios from 'axios';

const axiosProduct = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PRODUCT_URI, // e.g., http://localhost:6002/api
  withCredentials: true,
});

export default axiosProduct;
