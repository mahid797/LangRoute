'use client';

/**
 * useSignOutMutation.ts
 * -----------------------------------------------------------------------------
 * TanStack Query mutation hook for signing out from any authentication provider.
 *
 * Wraps NextAuth's signOut function with React Query's mutation pattern,
 * providing consistent loading/error states and integration with the project's
 * Service → Hook → Component architecture.
 *
 * @example
 * ```tsx
 * const { mutate: signOut, isPending, error } = useSignOutMutation()
 *
 * const handleSignOut = () => {
 *   signOut({ callbackUrl: '/' })
 * }
 * ```
 */
import { useRouter } from 'next/navigation';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signOut } from 'next-auth/react';

import { mutationKeys } from '@/lib/mutationKeys';
import { isInternal } from '@/lib/utils';

/**
 * Request parameters for sign-out mutation
 */
export interface SignOutRequest {
	/** Optional URL to redirect to after successful sign-out. Defaults to '/login' */
	callbackUrl?: string;
}

/**
 * Response from sign-out mutation
 */
export interface SignOutResponse {
	/** Whether the sign-out was successful */
	success: boolean;
	/** Success message */
	message: string;
}

/**
 * Custom TanStack Query mutation hook for signing out.
 *
 * Provides a clean interface for triggering sign-out with built-in loading states,
 * error handling, and automatic cache invalidation to refresh session state.
 *
 * Uses NextAuth's client-side signOut with redirect disabled.
 * Invalidates session queries to ensure UI updates immediately.
 * Navigates to callbackUrl (falling back to '/login').
 *
 * @returns TanStack Query mutation object with sign-out functionality
 */
export function useSignOutMutation() {
	const router = useRouter();
	const queryClient = useQueryClient();

	return useMutation<SignOutResponse, Error, SignOutRequest>({
		mutationKey: mutationKeys.auth.logout,
		mutationFn: async () => {
			// Call NextAuth's signOut with redirect disabled
			await signOut({ redirect: false });

			return {
				success: true,
				message: 'Logged out successfully',
			};
		},
		onSuccess: async (_data, vars) => {
			// _data: SignOutResponse  (e.g., { success: true, message: '...' })
			// vars:  SignOutRequest   (whatever you passed to mutate)

			// Ensure no user data persists across sessions
			await queryClient.cancelQueries();
			queryClient.clear();

			// Navigate after cache is cleared
			const target =
				vars?.callbackUrl && isInternal(vars.callbackUrl) ? vars.callbackUrl : '/login';
			router.replace(target);
		},
		// Mutation options
		meta: {
			action: 'Log out',
		},
	});
}
