/**
 * @deprecated (partial) – The legacy `onSubmit` fallback is deprecated.
 * Prefer the **adapter mode** using a `mutation`, which offers better integration with React Query DevTools,
 * error boundaries, and loading state handling.
 *
 * This hook itself is still supported for compatibility.
 * =============================================================================
 * A unified form‐submission hook that supports:
 *
 * 1️⃣ **Adapter mode** (preferred):
 *    – Pass a React-Query `mutation` (UseMutationResult).
 *    – `loading` and `error` mirror `mutation.isPending` / `mutation.error`.
 *    – You do **not** call `mutation.mutateAsync()` yourself.
 *    – Ideal for simple forms whose values map directly to the API payload.
 *
 * 2️⃣ **Legacy mode** (fallback):
 *    – Omit `mutation` and supply `onSubmit: async () => { … }`.
 *    – Hook manages its own `loading` / `error` via internal state.
 *    – Use when you need to transform values, set per-field errors,
 *      or chain multiple API calls before the final toast.
 *
 * **Example: CreateModal (legacy mode)**
 * ```ts
 * // needs payload transform + server-side alias conflict handling
 * const { loading, handleSubmit } = useFormSubmission({
 *   validate: () => isValid,
 *   onSubmit: async () => {
 *     try {
 *       const payload = getPayload();
 *       await createModal.mutateAsync({ id, payload });
 *     } catch (e) {
 *       // set field‐level errors, then rethrow for generic toast
 *       form.setError('name', { message: e.message });
 *       throw e;
 *     }
 *   },
 *   successMessage: 'Link created!',
 *   errorMessage: 'Failed to create link.',
 * });
 * ```
 *
 * **Example: register (adapter mode)**
 * ```ts
 * // form values pass straight through to the mutation
 * const { loading, handleSubmit } = useFormSubmission({
 *   mutation: registerMutation,
 *   validate: () => isValid,
 *   successMessage: 'Account created!',
 *
 *   // ── Choose ONE of the error-toast strategies below ──
 *
 *   // Option A — automatic error toast from the hook:
 *   // errorMessage: "Unable to create account!",
 *   // (omit `skipDefaultToast` so the hook auto-toasts)
 *
 *   // Option B — manual error toast with react-hot-toast:
 *   // onError: toast.showToast({ message: 'Unable to create account!', variant: 'error' }),
 *   // skipDefaultToast: true, // prevents the hook from auto-toasting
 * });
 * ```
 *
 * @param mutation       A TanStack Query `UseMutationResult`. When provided, the hook wires `loading` / `error` directly.
 * @param onSubmit       Fallback async callback (ignored if `mutation` is set).
 * @param validate       Optional synchronous predicate. Return `false` to abort.
 * @param getVariables   Optional function to retrieve variables for the mutation (if needed).
 * @param onSuccess      Optional callback after a successful submit.
 * @param onError        Optional callback on error (receives error message).
 * @param successMessage Optional toast text on success (unless `skipDefaultToast`).
 * @param errorMessage   Optional fallback toast text if the error is unstructured.
 * @param skipDefaultToast When `true`, the hook will not show automatic toasts.
 *
 * @returns `{ loading, error, handleSubmit, toast }`
 *  – `loading`: boolean
 *  – `error`: string
 *  – `handleSubmit`: attach to your `<form onSubmit={handleSubmit}>`
 *  – `toast`: ToastAPI — small adapter over `react-hot-toast` with `{ showToast, dismiss, raw }`
 * =============================================================================
 */
import { FormEvent, useState } from 'react';

import { toast as hotToast } from 'react-hot-toast';

import type { UseMutationResult } from '@tanstack/react-query';

import { ValidationAbortError } from './useFormWithSchema';

type Variant = 'success' | 'error' | 'loading' | 'blank';

// helper: turn unknown error into a string message
function toMessage(err: unknown): string {
	if (!err) return 'An unexpected error occurred.';
	if (typeof err === 'string') return err;
	if (err instanceof Error) return err.message;
	const maybe = err as { message?: string; response?: { data?: { message?: string } } };
	return maybe?.response?.data?.message ?? maybe?.message ?? 'An unexpected error occurred.';
}

interface UseFormSubmissionProps<
	V = void, // variables (default: no variables)
	R = unknown, // result data
	E = unknown, // error type
	C = unknown, // context
> {
	/** TanStack Query mutation; enables adapter mode when supplied. */
	mutation?: UseMutationResult<R, E, V, C>;
	/**
	 * @deprecated Legacy fallback; avoid using this unless mutation cannot be used.
	 * Prefer passing a TanStack `mutation` instead.
	 */
	onSubmit?: () => Promise<void>;
	/** Client-side validator – return `true` to proceed. */
	validate?: () => boolean;
	getVariables?: () => V;
	onSuccess?: (result?: R) => void;
	onError?: (error: E) => void;
	/** Pre-canned toast messages on success/failure. */
	successMessage?: string;
	errorMessage?: string;
	/** Disable automatic toasts if you handle them manually. */
	skipDefaultToast?: boolean;
}

export const useFormSubmission = <V = void, R = unknown, E = unknown, C = unknown>({
	mutation,
	onSubmit,
	getVariables,
	validate,
	onSuccess,
	onError,
	successMessage,
	errorMessage,
	skipDefaultToast = false,
}: UseFormSubmissionProps<V, R, E, C>) => {
	const [localLoading, setLocalLoading] = useState(false);
	const [localError, setLocalError] = useState('');

	const loading = mutation ? mutation.isPending : localLoading;
	const error = mutation ? toMessage(mutation.error as unknown) : localError;

	/* ---------- react-hot-toast adapter ---------- */
	const toast = {
		showToast: ({
			message,
			variant = 'blank' as Variant,
		}: {
			message: string;
			variant?: Variant;
		}) => {
			switch (variant) {
				case 'success':
					hotToast.success(message);
					break;
				case 'error':
					hotToast.error(message);
					break;
				case 'loading':
					hotToast.loading(message);
					break;
				default:
					hotToast(message);
			}
		},
		dismiss: (id?: string) => hotToast.dismiss(id),
		// expose native if you want advanced usage:
		raw: hotToast,
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (validate && !validate()) return;

		try {
			let result: R | undefined;

			if (mutation) {
				/* ---------- adapter mode (tanstack-query) ---------- */
				const variables = getVariables ? getVariables() : undefined;
				result = await mutation.mutateAsync(variables as unknown as V);
			} else if (onSubmit) {
				/** @deprecated Legacy fallback mode */
				setLocalLoading(true);
				await onSubmit();
			}

			if (successMessage && !skipDefaultToast) {
				toast.showToast({ message: successMessage, variant: 'success' });
			}
			onSuccess?.(result);
		} catch (err: unknown) {
			if (err instanceof ValidationAbortError) return;

			const message = toMessage(err);

			if (!skipDefaultToast) {
				toast.showToast({ message: errorMessage || message, variant: 'error' });
			}

			if (!mutation) setLocalError(message); // mutation already exposes its own error
			onError?.(err as E);
		} finally {
			if (!mutation) setLocalLoading(false);
		}
	};

	return { loading, error, handleSubmit, toast };
};
