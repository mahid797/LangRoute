'use client';

import React from 'react';

import NextLink from 'next/link';
import { useRouter } from 'next/navigation';

import { useForgotPasswordMutation } from '@hooks/data';
import { useFormWithSchema } from '@hooks/forms';

import { Button, FormInput } from '@components';

import { handleFormError } from '@/lib/utils';
import { ForgotPasswordSchema, forgotPasswordDefaults } from '@/lib/validation';
import { Form } from '@/shadcn-ui';

export default function ForgotPasswordPage() {
	const router = useRouter();
	const forgotPasswordMutation = useForgotPasswordMutation();

	// Initialize form with schema and defaults
	const form = useFormWithSchema(ForgotPasswordSchema, forgotPasswordDefaults);

	const onSubmit = form.handleSubmit(async (data) => {
		try {
			const response = await forgotPasswordMutation.mutateAsync(data);

			// Dev-only: jump straight to reset with token
			if (response?.token) {
				router.replace(`/password/reset?token=${encodeURIComponent(response.token)}`);
			} else {
				// Fallback: a dev page that explains what's happening
				router.replace('/password/reset?dev=1');
			}
		} catch (err) {
			handleFormError(err, {
				setError: form.setError,
				errorMessage: 'Could not send reset instructions.',
			});
		}
	});

	return (
		<>
			<div className='flex flex-col items-center gap-4'>
				<h1 className='h1'>Forgot password?</h1>
				<p className='body2'>Enter your account email to continue.</p>
			</div>
			<Form {...form}>
				<form
					onSubmit={onSubmit}
					className='min-w-[25em]'
				>
					<div className='mb-10 flex flex-col gap-5'>
						<FormInput
							control={form.control}
							name='email'
							label='Email'
							type='email'
							placeholder='m@example.com'
						/>
					</div>
					<div>
						<Button
							type='submit'
							fullWidth
							disabled={!form.formState.isValid}
							loading={forgotPasswordMutation.isPending}
							loadingText='Processing...'
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
