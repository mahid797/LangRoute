/**
 * useRegisterMutation.ts
 * -----------------------------------------------------------------------------
 * Simple wrapper around POST /api/auth/register.
 * On success we don’t invalidate any query for now (no cache involved).
 */
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

import { RegisterUserData, RegisterUserResult } from '@/lib/models';

export default function useRegisterMutation() {
	return useMutation<RegisterUserResult, Error, RegisterUserData>({
		mutationFn: async ({ email, password, confirmPassword, name }) => {
			const { data } = await axios.post<RegisterUserResult>('/api/auth/register', {
				email,
				password,
				confirmPassword,
				name,
			});
			return data;
		},
	});
}
