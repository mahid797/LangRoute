'use client';

import React from 'react';

import {
	type Query,
	QueryClient,
	QueryClientProvider,
	defaultShouldDehydrateQuery,
	isServer,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

/**
 * Shared QueryClient configuration for both server and client environments.
 * Ensures consistent behavior across SSR and client-side rendering.
 */
const queryClientConfig = {
	defaultOptions: {
		queries: {
			// With SSR, we set a default staleTime above 0 to avoid refetching immediately on the client
			staleTime: 60 * 1000, // 1 minute
			refetchOnWindowFocus: false,
			retry: 0,
		},
		mutations: {
			retry: 0,
		},
		dehydrate: {
			// Include pending queries in dehydration for streaming
			shouldDehydrateQuery: (query: Query) =>
				defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
		},
	},
} as const;

// Browser-only singleton QueryClient to prevent re-creation on React suspense
let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Gets or creates a QueryClient instance following Next.js App Router best practices.
 * - Server: Always creates a new query client for each request
 * - Browser: Reuses existing client to prevent re-creation on React suspense
 */
function getQueryClient() {
	if (isServer) {
		// Server: always make a new query client for each request
		return new QueryClient(queryClientConfig);
	} else {
		if (!browserQueryClient) browserQueryClient = new QueryClient(queryClientConfig);
		return browserQueryClient;
	}
}

/**
 * Client-side React Query provider with DevTools.
 * Provides TanStack Query state management for the entire application.
 */
export default function QueryProvider({ children }: { children: React.ReactNode }) {
	const queryClient = getQueryClient();

	return (
		<QueryClientProvider client={queryClient}>
			<ReactQueryDevtools initialIsOpen={false} />
			{children}
		</QueryClientProvider>
	);
}
