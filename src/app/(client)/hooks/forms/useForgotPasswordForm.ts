/**
 * useForgotPasswordForm.ts
 * ---------------------------------------------------------------------------
 * Thin RHF+Zod wrapper for the “Forgot password” screen.
 */
import { useFormWithSchema } from '@/app/(client)/hooks/forms';
import { ForgotPasswordSchema, forgotPasswordDefaults } from '@/lib/validation';

export function useForgotPasswordForm(mode: 'onBlur' | 'onChange' | 'onSubmit' = 'onBlur') {
	return useFormWithSchema(ForgotPasswordSchema, forgotPasswordDefaults, mode);
}
