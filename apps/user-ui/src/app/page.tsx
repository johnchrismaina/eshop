// app/page.tsx
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from '@tanstack/react-query';
import { prefetchLandingPageData } from '../lib/prefetch/landingPage';
import LandingPage from '../shared/components/landingPage/landing-page';

export default async function HomePage() {
  const queryClient = new QueryClient();

  // Prefetch multiple queries server-side
  await prefetchLandingPageData(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LandingPage />
    </HydrationBoundary>
  );
}
