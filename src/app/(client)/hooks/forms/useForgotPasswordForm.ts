/**
 * useForgotPasswordForm.ts
 * ---------------------------------------------------------------------------
 * Thin RHF+Zod wrapper for the “Forgot password” screen.
 */
import { ForgotPasswordSchema, forgotPasswordDefaults } from '@/lib/validation';

import { useFormWithSchema } from './useFormWithSchema';

export function useForgotPasswordForm(mode: 'onBlur' | 'onChange' | 'onSubmit' = 'onBlur') {
	return useFormWithSchema(ForgotPasswordSchema, forgotPasswordDefaults, mode);
}
