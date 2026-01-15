'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import React, { useState } from 'react';

function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowsFocus: false,
            staleTime: 1000 * 60 * 5,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export default Providers;
