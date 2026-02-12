// apps/user-ui/src/lib/queries/products.ts
import axiosProductService from '../../utils/axiosProductService';

export const fetchEvents = async () => {
  const res = await axiosProductService.get(
    '/product/get-all-events?page=1&limit=10'
  );
  return res.data.events;
};
