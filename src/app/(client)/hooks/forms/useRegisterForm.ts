/**
 * useRegisterForm.ts
 * -----------------------------------------------------------------------------
 * Handles extra convenience state used by the live <PasswordValidation> meter.
 */
import { useWatch } from 'react-hook-form';

import { RegisterSchema, registerDefaults } from '@/lib/validation';

import { useFormWithSchema } from './useFormWithSchema';

export function useRegisterForm(mode: 'onBlur' | 'onChange' | 'onSubmit' = 'onBlur') {
	const form = useFormWithSchema(RegisterSchema, registerDefaults, mode);

	/* Derive helpers consumed by PasswordValidation component */
	const watchPassword = useWatch({ control: form.control, name: 'password' });
	const isPasswordTouched = !!form.formState.touchedFields.password;

	return { ...form, watchPassword, isPasswordTouched };
}
