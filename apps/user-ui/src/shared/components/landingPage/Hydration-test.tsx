'use client';

import React from 'react';
import { useHydrationSafeQuery } from 'apps/user-ui/src/hooks/useHydrationSafeQuery';
import { fetchHello } from 'apps/user-ui/src/hooks/fakeQuery';
import { logInfo } from 'packages/utils/logger';

const HydrationTest = () => {
  const { data, isLoading, isError, isFetching, isFetched } =
    useHydrationSafeQuery(
      {
        queryKey: ['hello'],
        queryFn: fetchHello,
        staleTime: 60 * 1000,
      },
      undefined
    );

  logInfo('[HydrationTest Debug]', {
    source: typeof window === 'undefined' ? 'server' : 'client',
    data,
    isLoading,
    isError,
    isFetching,
    isFetched,
  });

  if (isLoading) return <p>Loading…</p>;
  if (isError) return <p>Error!</p>;

  return <p>HydrationTest says: {data}</p>;
};

export default HydrationTest;
