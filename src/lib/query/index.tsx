/**
 * TanStack Query Configuration for FlowCRM
 *
 * Provides:
 * - Server state management
 * - Intelligent caching
 * - Automatic background refetching
 * - Centralized error handling
 * - Optimistic updates
 */
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query';
import React from 'react';
import { useNotificationStore } from '@/stores';
import { ERROR_CODES, getErrorMessage } from '@/lib/validations/errorCodes';

// ============ ERROR HANDLING ============

interface APIError {
  code: string;
  message: string;
  status?: number;
}

const handleQueryError = (error: unknown) => {
  const addNotification = useNotificationStore.getState().addNotification;

  let errorMessage = getErrorMessage(ERROR_CODES.API_ERROR);

  if (error instanceof Error) {
    // Network error
    if (error.message === 'Failed to fetch') {
      errorMessage = getErrorMessage(ERROR_CODES.API_NETWORK_ERROR);
    }
    // Timeout
    else if (error.name === 'AbortError') {
      errorMessage = getErrorMessage(ERROR_CODES.API_TIMEOUT);
    }
    // API error with code
    else if ('code' in error) {
      const apiError = error as unknown as APIError;
      if (apiError.status === 401) {
        errorMessage = getErrorMessage(ERROR_CODES.API_UNAUTHORIZED);
      } else if (apiError.status === 404) {
        errorMessage = getErrorMessage(ERROR_CODES.API_NOT_FOUND);
      }
    }
  }

  addNotification({
    type: 'error',
    title: 'Erro',
    message: errorMessage,
  });
};

const handleMutationError = (error: unknown, _variables: unknown, _context: unknown) => {
  handleQueryError(error);
};

// ============ QUERY CLIENT ============

/**
 * Smart retry: NEVER retry 4xx errors (schema mismatch, RLS denial, auth).
 * These are deterministic failures — retrying them causes OOM loops.
 * Only retry 5xx (server errors) and network errors.
 */
const shouldRetryQuery = (failureCount: number, error: unknown): boolean => {
  if (failureCount >= 2) return false;  // max 2 retries for transient errors
  if (error && typeof error === 'object') {
    const status = (error as any).status || (error as any).code;
    // 400 Bad Request, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Unprocessable
    if (typeof status === 'number' && status >= 400 && status < 500) return false;
    // Supabase PostgREST error codes (string like '42501')
    const pgCode = (error as any).code;
    if (typeof pgCode === 'string' && /^(42|23|22)/.test(pgCode)) return false;
    // Check message for known non-retryable patterns
    const msg = (error as any).message || '';
    if (/permission denied|violates|not found|already exists|company_id/i.test(msg)) return false;
  }
  return true;  // retry network errors, 5xx, timeouts
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache time: 30 minutes
      gcTime: 30 * 60 * 1000,
      // Smart retry: skip 4xx errors that cause OOM loops
      retry: shouldRetryQuery,
      // Retry delay with exponential backoff (capped at 10s)
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
      // DISABLED: refetchOnWindowFocus was triggering cascading re-renders after errors
      refetchOnWindowFocus: false,
      // Don't refetch on mount if data is fresh
      refetchOnMount: true,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // NEVER retry mutations — a failed INSERT/UPDATE should show error, not loop
      retry: false,
    },
  },
  queryCache: new QueryCache({
    onError: handleQueryError,
  }),
  mutationCache: new MutationCache({
    onError: handleMutationError,
  }),
});

// ============ PROVIDER ============

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

import { queryKeys } from './queryKeys';

// ============ CUSTOM HOOKS ============
// These will be used when we have a real API

/**
 * Hook for optimistic updates on mutations
 */
export const useOptimisticMutation = <TData, TVariables, TContext>(options: {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey: readonly unknown[];
  optimisticUpdate: (oldData: TData | undefined, variables: TVariables) => TData;
  onSuccess?: (data: TData, variables: TVariables, context: TContext) => void;
  onError?: (error: Error, variables: TVariables, context: TContext | undefined) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: options.mutationFn,
    onMutate: async variables => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: options.queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<TData>(options.queryKey);

      // Optimistically update
      queryClient.setQueryData<TData>(options.queryKey, old =>
        options.optimisticUpdate(old, variables)
      );

      return { previousData } as TContext;
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context && typeof context === 'object' && 'previousData' in context) {
        queryClient.setQueryData(
          options.queryKey,
          (context as { previousData: TData }).previousData
        );
      }
      options.onError?.(error, variables, context);
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: options.queryKey });
    },
    onSuccess: options.onSuccess,
  });
};

// ============ PREFETCH HELPERS ============

/**
 * Prefetch data for a route before navigation
 */
export const prefetchRouteData = async (route: string) => {
  switch (route) {
    case 'dashboard':
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: queryKeys.dashboard.stats,
          queryFn: async () => {
            // Will be replaced with actual API call
            return null;
          },
        }),
      ]);
      break;
    case 'contacts':
      await queryClient.prefetchQuery({
        queryKey: queryKeys.contacts.lists(),
        queryFn: async () => null,
      });
      break;
    // Add more routes as needed
  }
};

// Re-export hooks from TanStack Query
export { useQuery, useMutation, useQueryClient };

// Re-export queryKeys
export { queryKeys };

// Re-export entity hooks
export * from './hooks';
