'use client';

import React, { useEffect } from 'react';

import NextLink from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { useQueryClient } from '@tanstack/react-query';

import { Button, FormInput, PasswordValidation } from '@components';

import { useResetPasswordMutation } from '@/app/(client)/hooks/data';
import { useFormSubmission, useResetPasswordForm } from '@/app/(client)/hooks/forms';
import { queryKeys } from '@/lib/queryKeys';
import { Form } from '@/shadcn-ui';

export default function ResetPasswordForm() {
	const router = useRouter();
	const ResetPasswordMutation = useResetPasswordMutation();
	const queryClient = useQueryClient();
	const form = useResetPasswordForm();
	const params = useSearchParams();
	const token = params.get('token') ?? '';

	const {
		getValues,
		formState: { isValid },
		watchPassword,
		isPasswordTouched,
	} = form;

	const { loading, handleSubmit, toast } = useFormSubmission({
		onSubmit: async () => {
			await ResetPasswordMutation.mutateAsync({
				token,
				newPassword: getValues('newPassword'),
				confirmPassword: getValues('confirmPassword'),
			});
		},
		onSuccess: async () => {
			// Invalidate auth cache so useSessionUser refetches immediately.
			await queryClient.invalidateQueries({ queryKey: queryKeys.auth.session });

			const message = ResetPasswordMutation.data?.message ?? 'Your password has been reset.';
			toast.showToast({ message, variant: 'success' });

			router.replace('/login?reset=done');
		},
		onError: (err) => {
			const message = err instanceof Error ? err.message : 'Could not reset password';
			toast.showToast({ message, variant: 'error' });
		},
		skipDefaultToast: true,
	});

	/* ------------- early-guard: no token ------------- */
	useEffect(() => {
		if (!token) {
			toast.showToast({
				message: 'We couldn’t retrieve a reset token. Please try again.',
				variant: 'error',
			});
			router.replace('/password/forgot');
		}
	}, [token, router, toast]);

	return (
		<>
			<div className='flex flex-col items-center gap-4'>
				<h1 className='h1'>Set new password</h1>
				<p className='body2'>Your new password must be different from your previous password.</p>
			</div>
			<Form {...form}>
				<form
					onSubmit={handleSubmit}
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
							disabled={!isValid}
							loading={loading}
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
