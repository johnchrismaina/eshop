// apps/user-ui/src/lib/queries/products.ts
import axiosProductService from '../../utils/axiosProductService';

export const fetchTopShops = async () => {
  const res = await axiosProductService.get('/api/top-shops');
  return res.data.shops;
};
