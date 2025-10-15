/**
 * useForgotPasswordMutation.ts
 * ---------------------------------------------------------------------------
 * Wraps POST /api/auth/password/forgot in a TanStack-Query mutation.
 */
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

import { ForgotPasswordData, ForgotPasswordResult } from '@/lib/models';
import { mutationKeys } from '@/lib/mutationKeys';

export default function useForgotPasswordMutation() {
	return useMutation<ForgotPasswordResult, Error, ForgotPasswordData>({
		mutationKey: mutationKeys.auth.forgotPassword,
		mutationFn: async ({ email }) => {
			const { data } = await axios.post<ForgotPasswordResult>('/api/auth/password/forgot', {
				email,
			});
			return data;
		},
	});
}
