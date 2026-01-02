import { type FieldValues, type Path, type UseFormSetError } from 'react-hook-form';
import { toast } from 'react-hot-toast';

import { AxiosError } from 'axios';

/**
 * Error response structure from the API.
 */
interface ApiErrorResponse {
	error: {
		message: string;
		code?: string;
	};
	fieldErrors?: Record<string, string>;
	requestId?: string;
	ts?: string;
}

/**
 * Extracts the error message from various error types.
 * Handles axios errors, API error responses, and generic errors.
 *
 * @param err - The error to extract the message from.
 * @returns The extracted error message.
 */
export function getErrorMessage(err: unknown): string {
	// Check for axios-like error structure (includes custom AuthError)
	if (err && typeof err === 'object' && 'response' in err) {
		const response = (err as { response?: { data?: { error?: { message?: string } } } }).response;
		if (response?.data?.error?.message) {
			return response.data.error.message;
		}
	}
	if (err instanceof AxiosError && err.response?.data?.error?.message) {
		return err.response.data.error.message;
	}
	if (err instanceof Error) {
		return err.message;
	}
	return 'An unexpected error occurred';
}

/**
 * Options for handling form errors.
 */
interface HandleFormErrorOptions<TFieldValues extends FieldValues> {
	/** Form setError function from react-hook-form */
	setError: UseFormSetError<TFieldValues>;
	/** Optional custom toast error message (falls back to API message) */
	errorMessage?: string;
	/** Skip showing toast notification */
	skipToast?: boolean;
}

/**
 * Handles form submission errors by:
 * 1. Setting field-specific errors from the API response
 * 2. Showing a toast notification with the general error message
 *
 * Usage:
 * ```tsx
 * try {
 *   await loginMutation.mutateAsync(data);
 * } catch (err) {
 *   handleFormError(err, { setError: form.setError });
 * }
 * ```
 *
 * @param err - The error from the mutation
 * @param options - Configuration for error handling
 */
export function handleFormError<TFieldValues extends FieldValues>(
	err: unknown,
	options: HandleFormErrorOptions<TFieldValues>,
) {
	const { setError, errorMessage, skipToast } = options;

	// Extract field errors from API response (supports both Axios and custom error structures)
	let fieldErrors: Record<string, string> | undefined;

	if (err instanceof AxiosError) {
		fieldErrors = (err.response?.data as ApiErrorResponse | undefined)?.fieldErrors;
	} else if (err && typeof err === 'object' && 'response' in err) {
		// Handle custom error structures (like AuthError from useLoginMutation)
		const response = (err as { response?: { data?: ApiErrorResponse } }).response;
		fieldErrors = response?.data?.fieldErrors;
	}

	// Set field-specific errors
	if (fieldErrors) {
		Object.entries(fieldErrors).forEach(([field, message]) => {
			setError(field as Path<TFieldValues>, {
				type: 'server',
				message,
			});
		});
	}

	// Show toast notification
	if (!skipToast) {
		const message = errorMessage ?? getErrorMessage(err);
		toast.error(message);
	}
}
