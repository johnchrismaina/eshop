// apps/user-ui/src/lib/prefetch/landingPage.ts
import { QueryClient } from '@tanstack/react-query';
import { fetchProducts } from '../queries/products';
import { fetchLatestProducts } from '../queries/latest-products';
import { fetchTopShops } from '../queries/top-shops';
import { fetchEvents } from '../queries/deals';
import { fetchHello } from '../../hooks/fakeQuery';

export async function prefetchLandingPageData(queryClient: QueryClient) {
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['products'],
      queryFn: fetchProducts,
      staleTime: 30 * 1000, // 30s
    }),
    queryClient.prefetchQuery({
      queryKey: ['latest-products'],
      queryFn: fetchLatestProducts,
      staleTime: 30 * 1000, // 30s
    }),
    queryClient.prefetchQuery({
      queryKey: ['top-shops'],
      queryFn: fetchTopShops,
      staleTime: 60 * 1000, // 60s
    }),
    queryClient.prefetchQuery({
      queryKey: ['events'],
      queryFn: fetchEvents,
      staleTime: 15 * 1000, // 15s (very time-sensitive)
    }),
    queryClient.prefetchQuery({
      queryKey: ['hello'],
      queryFn: fetchHello,
    }),
  ]);
}
