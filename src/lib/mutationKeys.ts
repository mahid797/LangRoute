/**
 * mutationKeys.ts
 * -----------------------------------------------------------------------------
 * Canonical mutation keys for TanStack Query.
 *
 *  ›  Use with useMutation({ mutationKey })
 *  ›  Not for invalidation—use queryKeys for that. Shape: [domain, action, param?]
 * -----------------------------------------------------------------------------
 */

export const mutationKeys = {
	/* ------------------------------------------------------------------------ */
	/*  Auth                                                                    */
	/* ------------------------------------------------------------------------ */
	auth: {
		login: ['auth', 'login'] as const,
		register: ['auth', 'register'] as const,
		forgotPassword: ['auth', 'forgot-password'] as const,
		resetPassword: ['auth', 'reset-password'] as const,
		logout: ['auth', 'logout'] as const,
	},
} as const;
