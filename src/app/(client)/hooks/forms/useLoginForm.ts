/**
 * useLoginForm.ts
 * -----------------------------------------------------------------------------
 * Thin wrapper around useFormWithSchema for the “Login” screen.
 * No extra helpers needed besides the raw RHF API.
 */
import { LoginSchema, loginDefaults } from '@/lib/validation';

import { useFormWithSchema } from './useFormWithSchema';

export function useLoginForm(mode: 'onBlur' | 'onChange' | 'onSubmit' = 'onBlur') {
	return useFormWithSchema(LoginSchema, loginDefaults, mode);
}
