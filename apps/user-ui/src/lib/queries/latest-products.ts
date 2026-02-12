// apps/user-ui/src/lib/queries/products.ts
import axiosProductService from '../../utils/axiosProductService';

export const fetchLatestProducts = async () => {
  const res = await axiosProductService.get(
    '/product/get-all-products?page=1&limit=10&type=latest'
  );
  return res.data.products;
};
