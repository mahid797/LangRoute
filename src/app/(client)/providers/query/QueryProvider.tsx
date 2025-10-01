'use client';

import React, { useMemo } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { getQueryClient } from './QueryClientProvider';

interface QueryProviderProps {
	children: React.ReactNode;
}

const QueryProvider = ({ children }: QueryProviderProps) => {
	const queryClient = useMemo(() => getQueryClient(), []);

	return (
		<QueryClientProvider client={queryClient}>
			<ReactQueryDevtools initialIsOpen={false} />
			{children}
		</QueryClientProvider>
	);
};

export default QueryProvider;
