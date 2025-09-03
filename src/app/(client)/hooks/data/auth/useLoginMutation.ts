/**
 * useLoginMutation.ts
 * -----------------------------------------------------------------------------
 * React-Query mutation that wraps NextAuth’s credentials sign-in.
 *
 * • Keeps loading/error state in RTK-DevTools.
 * • Throws on `error` so useFormSubmission can handle the toast.
 */
import { useMutation } from '@tanstack/react-query';
import { signIn } from 'next-auth/react';

import { LoginData, LoginResult } from '@/lib/models';

export default function useLoginMutation() {
	return useMutation<LoginResult, Error, LoginData>({
		mutationFn: async ({ email, password }) => {
			const res = await signIn('credentials', {
				redirect: false,
				email,
				password,
			});

			if (!res) throw new Error('No response from auth server');
			if (res.error) throw new Error(res.error);

			return {
				success: true,
				message: 'Logged-in',
				url: res.url,
			};
		},
	});
}
