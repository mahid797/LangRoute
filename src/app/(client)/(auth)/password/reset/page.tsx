'use client';

import React, { useEffect, useRef } from 'react';

import toast from 'react-hot-toast';

import NextLink from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { useResetPasswordMutation } from '@hooks/data';
import { useFormWithSchema } from '@hooks/forms';

import { Button, FormInput, PasswordValidation } from '@components';

import { handleFormError } from '@/lib/utils';
import { ResetPasswordFormSchema, resetPasswordFormDefaults } from '@/lib/validation';
import { Form } from '@/shadcn-ui';

export default function ResetPasswordPage() {
	const router = useRouter();
	const params = useSearchParams();
	const resetPasswordMutation = useResetPasswordMutation();

	// Initialize form with schema and defaults
	const form = useFormWithSchema(ResetPasswordFormSchema, resetPasswordFormDefaults);

	// Watch for password changes to feed into the PasswordValidation component
	const watchPassword = form.watch('newPassword');
	const isPasswordTouched = form.formState.touchedFields.newPassword;

	// Retrieve the reset token from the URL
	const token = params.get('token') ?? '';

	// Redirect the user if the reset token is missing from the URL.
	const didNotify = useRef(false);
	useEffect(() => {
		if (!token && !didNotify.current) {
			didNotify.current = true; // Prevents double-firing in StrictMode
			toast.error('We couldn’t retrieve a reset token. Please try again.');
			router.replace('/password/forgot');
		}
	}, [token, router]);

	const onSubmit = form.handleSubmit(async (data) => {
		try {
			const response = await resetPasswordMutation.mutateAsync({ ...data, token });
			const message = response?.message ?? 'Your password has been reset successfully.';
			toast.success(message);
			router.replace('/login?reset=done');
		} catch (err) {
			handleFormError(err, {
				setError: form.setError,
				errorMessage: 'Could not reset your password.',
			});
		}
	});

	// Render nothing to prevent a UI flicker while the redirect happens
	if (!token) return null;

	return (
		<>
			<div className='flex flex-col items-center gap-4'>
				<h1 className='h1'>Set new password</h1>
				<p className='body2'>Your new password must be different from your previous password.</p>
			</div>
			<Form {...form}>
				<form
					onSubmit={onSubmit}
					className='min-w-[25em]'
				>
					<div className='mb-10 flex flex-col gap-5'>
						<FormInput
							control={form.control}
							name='newPassword'
							label='New password'
							type='password'
							placeholder='Create a password'
						/>
						<FormInput
							control={form.control}
							name='confirmPassword'
							label='Confirm password'
							type='password'
							placeholder='Confirm your password'
						/>
					</div>

					{/* Real-time password strength feedback */}
					<PasswordValidation
						passwordValue={watchPassword}
						isBlur={isPasswordTouched}
					/>

					<div>
						<Button
							type='submit'
							fullWidth
							disabled={!form.formState.isValid}
							loading={resetPasswordMutation.isPending}
							loadingText='Resetting...'
						>
							Reset password
						</Button>
					</div>
				</form>
			</Form>
			<NextLink href='/login'>← Back to login</NextLink>
		</>
	);
}
