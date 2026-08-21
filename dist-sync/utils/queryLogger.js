"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logQueryState = logQueryState;
// packages/utils/queryLogger.ts
function logQueryState(queryKey, result) {
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
