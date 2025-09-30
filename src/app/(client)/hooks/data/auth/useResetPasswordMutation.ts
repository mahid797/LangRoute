/**
 * useResetPasswordMutation.ts
 * ---------------------------------------------------------------------------
 * Wraps POST /api/auth/password/reset in a TanStack-Query mutation.
 */
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

import { ResetPasswordData, ResetPasswordResult } from '@/lib/models';
import { mutationKeys } from '@/lib/mutationKeys';

export default function useResetPasswordMutation() {
	return useMutation<ResetPasswordResult, Error, ResetPasswordData>({
		mutationKey: mutationKeys.auth.resetPassword,
		mutationFn: async ({ token, newPassword, confirmPassword }) => {
			const { data } = await axios.post<ResetPasswordResult>('/api/auth/password/reset', {
				token,
				newPassword,
				confirmPassword,
			});
			return data;
		},
	});
}
