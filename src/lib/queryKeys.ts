/**
 * queryKeys.ts
 * -----------------------------------------------------------------------------
 * Canonical keys for TanStack Query.
 *
 *  ›  Import from here—never hard-code strings in hooks or components.
 *  ›  Array shape is always:  [domain, id? , subresource?]
 * -----------------------------------------------------------------------------
 */

export const queryKeys = {
	/* ------------------------------------------------------------------------ */
	/*  Auth                                                                    */
	/* ------------------------------------------------------------------------ */
	auth: {
		all: ['auth'] as const,
		session: ['auth', 'session'] as const,
	},
} as const;
