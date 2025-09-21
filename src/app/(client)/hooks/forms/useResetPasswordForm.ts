/**
 * useResetPasswordForm.ts
 * ---------------------------------------------------------------------------
 * RHF + Zod wrapper for the “Reset password” screen.
 * Includes helpers for the live <PasswordValidation/> component.
 */
import { useWatch } from 'react-hook-form';

import { useFormWithSchema } from '@/app/(client)/hooks/forms';
import { ResetPasswordFormSchema, resetPasswordFormDefaults } from '@/lib/validation';

export function useResetPasswordForm(mode: 'onBlur' | 'onChange' | 'onSubmit' = 'onBlur') {
	const form = useFormWithSchema(ResetPasswordFormSchema, resetPasswordFormDefaults, mode);

	/* helpers for PasswordValidation */
	const watchPassword = useWatch({ control: form.control, name: 'newPassword' });
	const isPasswordTouched = !!form.formState.touchedFields.newPassword;

	return { ...form, watchPassword, isPasswordTouched };
}
