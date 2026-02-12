// packages/utils/queryLogger.ts
export function logQueryState(queryKey: string, result: any) {
  const { isLoading, isError, isFetched, isFetching, data } = result;
  console.log(`[Query Debug] ${queryKey}`, {
    source: typeof window === 'undefined' ? 'server' : 'client',
    isLoading,
    isError,
    isFetched,
    isFetching,
    dataCount: Array.isArray(data) ? data.length : data ? 1 : 0,
  });
}
