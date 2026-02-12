'use client';

import { HydrationBoundary } from '@tanstack/react-query';
import HydrationTest from '../shared/components/landingPage/Hydration-test';
// import HydrationTest from '../shared/components/HydrationTest';

export default function HydrationWrapper({
  dehydratedState,
}: {
  dehydratedState: string;
}) {
  // ✅ Parse back into object
  const parsedState = JSON.parse(dehydratedState);

  return (
    <HydrationBoundary state={parsedState}>
      <HydrationTest />
    </HydrationBoundary>
  );
}
