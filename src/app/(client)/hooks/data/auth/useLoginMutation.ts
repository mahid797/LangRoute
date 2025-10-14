/**
 * useLoginMutation.ts
 * -----------------------------------------------------------------------------
 * React-Query mutation that wraps NextAuth's credentials sign-in.
 *
 * • Keeps loading/error state in TanStack Query DevTools.
 * • Parses structured errors with fieldErrors from NextAuth authorize().
 * • Throws structured errors for formUtils.handleFormError to process.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signIn } from 'next-auth/react';

import { LoginData, LoginResult } from '@/lib/models';
import { mutationKeys } from '@/lib/mutationKeys';
import { queryKeys } from '@/lib/queryKeys';

/**
 * Custom error that mimics axios error structure for formUtils compatibility.
 */
class AuthError extends Error {
	constructor(
		message: string,
		public response?: {
			data?: { error?: { message: string }; fieldErrors?: Record<string, string> };
		},
	) {
		super(message);
		this.name = 'AuthError';
	}
}

export default function useLoginMutation() {
	const queryClient = useQueryClient();

	return useMutation<LoginResult, AuthError, LoginData>({
		mutationKey: mutationKeys.auth.login,
		mutationFn: async ({ email, password }) => {
			const res = await signIn('credentials', {
				redirect: false,
				email,
				password,
			});

			if (!res) throw new AuthError('No response from auth server');

			if (!res.ok || res.error) {
				// Try to parse JSON-encoded error from NextAuth authorize()
				try {
					const parsed = JSON.parse(res.error ?? '{}') as {
						message?: string;
						fieldErrors?: Record<string, string>;
					};

					// Throw structured error that formUtils can handle
					throw new AuthError(parsed.message ?? 'Login failed', {
						data: {
							error: { message: parsed.message ?? 'Login failed' },
							fieldErrors: parsed.fieldErrors,
						},
					});
				} catch (e) {
					// If not JSON, treat as plain error message
					if (e instanceof AuthError) throw e;
					throw new AuthError(res.error ?? 'Login failed');
				}
			}

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
