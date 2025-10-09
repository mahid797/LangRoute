/**
 * useLoginMutation.ts
 * -----------------------------------------------------------------------------
 * React-Query mutation that wraps NextAuth’s credentials sign-in.
 *
 * • Keeps loading/error state in TanStack Query DevTools.
 * • Throws on `error` so useFormSubmission can handle the toast.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signIn } from 'next-auth/react';

import { LoginData, LoginResult } from '@/lib/models';
import { mutationKeys } from '@/lib/mutationKeys';
import { queryKeys } from '@/lib/queryKeys';

export default function useLoginMutation() {
	const queryClient = useQueryClient();

	return useMutation<LoginResult, Error, LoginData>({
		mutationKey: mutationKeys.auth.login,
		mutationFn: async ({ email, password }) => {
			const res = await signIn('credentials', {
				redirect: false,
				email,
				password,
			});

			if (!res) throw new Error('No response from auth server');
			if (!res.ok || res.error) throw new Error(res.error ?? 'Login failed');

			return {
				success: true,
				message: 'Logged-in',
				url: res.url,
			};
		},

		onSuccess: () => {
			// Invalidate auth cache so useSessionUser refetches immediately.
			void queryClient.invalidateQueries({ queryKey: queryKeys.auth.session });
		},
	});
}
