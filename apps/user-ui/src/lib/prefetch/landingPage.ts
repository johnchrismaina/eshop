import { QueryClient } from '@tanstack/react-query';
import { fetchProducts } from '../queries/products';
import { fetchLatestProducts } from '../queries/latest-products';
import { fetchTopShops } from '../queries/top-shops';
import { fetchEvents } from '../queries/events';

export async function prefetchLandingPageData(queryClient: QueryClient) {
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['products'],
      queryFn: fetchProducts,
    }),
    queryClient.prefetchQuery({
      queryKey: ['latest-products'],
      queryFn: fetchLatestProducts,
    }),
    queryClient.prefetchQuery({
      queryKey: ['top-shops'],
      queryFn: fetchTopShops,
    }),
    queryClient.prefetchQuery({ queryKey: ['events'], queryFn: fetchEvents }),
  ]);
}
