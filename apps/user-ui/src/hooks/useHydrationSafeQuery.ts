// apps/user-ui/src/hooks/useHydrationSafeQuery.ts
'use client';

import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

/**
 * Hydration-safe wrapper around useQuery.
 * Ensures SSR and CSR render the same initial markup by using prefetched cache when available.
 * Falls back to defaultData only if no hydrated data exists.
 */
export function useHydrationSafeQuery<TData>(
  options: UseQueryOptions<TData>,
  defaultData: TData
): UseQueryResult<TData> {
  const safeOptions: UseQueryOptions<TData> = {
    ...options,
    // ✅ Always allow queries; hydration will provide prefetched data
    enabled: options.enabled ?? true,
    // ✅ Use hydrated initialData if present, otherwise fallback
    initialData: options.initialData ?? defaultData,
  };

  return useQuery<TData>(safeOptions);
}
