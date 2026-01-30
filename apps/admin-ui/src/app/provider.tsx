'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Toaster } from 'sonner';

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-right"
        richColors
        toastOptions={{
          className: 'my-toast',
          style: { background: '#333', color: '#fff' },
        }}
      />
    </QueryClientProvider>
  );
};

export default Providers;
