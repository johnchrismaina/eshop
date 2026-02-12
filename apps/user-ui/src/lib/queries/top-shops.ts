// apps/user-ui/src/lib/queries/products.ts
import axiosProductService from '../../utils/axiosProductService';

export const fetchTopShops = async () => {
  const res = await axiosProductService.get('/product/top-shops');
  return res.data.shops;
};
