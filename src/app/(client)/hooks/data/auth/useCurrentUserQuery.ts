/**
 * useCurrentUserQuery.ts
 * -----------------------------------------------------------------------------
 * GET /api/auth/me with a short stale window (≤30s).
 *
 * • Axios version with AbortController support via React Query's `signal`.
 * • Returns the raw session payload and `user` convenience field.
 * • Works with `invalidateQueries(queryKeys.auth.me())` after auth mutations.
 */
import { Role } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { SessionQueryResult } from '@/lib/models';
import { queryKeys } from '@/lib/queryKeys';

export default function useCurrentUserQuery() {
	const { data, isLoading, isFetching, isError, refetch } = useQuery<SessionQueryResult>({
		queryKey: queryKeys.auth.me(),
		// React Query passes `signal` for cancellation; forward it to axios:
		queryFn: async ({ signal }) => {
			const response = await axios.get<SessionQueryResult>('/api/auth/me', {
				withCredentials: true,
				signal, // enables cancel on unmount/retry
			});
			return response.data;
		},
		staleTime: 30 * 1000, // Cache for 30 seconds
		retry: 2,
	});

	return {
		data,
		user: data?.user ?? null,
		isAdmin: data?.user?.role === Role.ADMIN,
		isAuthenticated: !!data?.user,
		isLoading,
		isFetching,
		isError,
		refetch,
	};
}
