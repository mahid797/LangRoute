/**
 * useRegisterForm.ts
 * -----------------------------------------------------------------------------
 * Handles extra convenience state used by the live <PasswordValidation> meter.
 */
import { useWatch } from 'react-hook-form';

import { useFormWithSchema } from '@/app/(client)/hooks/forms';
import { RegisterSchema, registerDefaults } from '@/lib/validation';

export function useRegisterForm(mode: 'onBlur' | 'onChange' | 'onSubmit' = 'onBlur') {
	const form = useFormWithSchema(RegisterSchema, registerDefaults, mode);

	/* Derive helpers consumed by PasswordValidation component */
	const watchPassword = useWatch({ control: form.control, name: 'password' });
	const isPasswordTouched = !!form.formState.touchedFields.password;

	return { ...form, watchPassword, isPasswordTouched };
}
