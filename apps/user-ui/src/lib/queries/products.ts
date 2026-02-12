import axiosProductService from '../../utils/axiosProductService';

export const fetchProducts = async () => {
  try {
    console.log(
      'Fetching products from:',
      axiosProductService.defaults.baseURL
    );
    const res = await axiosProductService.get(
      '/product/get-all-products?page=1&limit=10'
    );
    console.log('Products response:', res.data);
    return res.data.products;
  } catch (error: any) {
    console.error('Fetch products error:', error.message);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};
