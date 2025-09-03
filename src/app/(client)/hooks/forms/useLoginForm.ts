/**
 * useLoginForm.ts
 * -----------------------------------------------------------------------------
 * Thin wrapper around useFormWithSchema for the “Login” screen.
 * No extra helpers needed besides the raw RHF API.
 */
import { useFormWithSchema } from '@/app/(client)/hooks/forms';
import { LoginSchema, loginDefaults } from '@/lib/validation';

export function useLoginForm(mode: 'onBlur' | 'onChange' | 'onSubmit' = 'onBlur') {
	return useFormWithSchema(LoginSchema, loginDefaults, mode);
}
