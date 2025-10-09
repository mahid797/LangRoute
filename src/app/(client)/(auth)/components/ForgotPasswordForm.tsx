'use client';

import React from 'react';

import NextLink from 'next/link';
import { useRouter } from 'next/navigation';

import { Button, FormInput } from '@components';

import { useForgotPasswordMutation } from '@/app/(client)/hooks/data';
import { useForgotPasswordForm, useFormSubmission } from '@/app/(client)/hooks/forms';
import { Form } from '@/shadcn-ui';

export default function ForgotPasswordForm() {
	const router = useRouter();
	const forgotPasswordMutation = useForgotPasswordMutation();
	const form = useForgotPasswordForm();

	const {
		getValues,
		formState: { isValid },
	} = form;

	const { loading, handleSubmit, toast } = useFormSubmission({
		mutation: forgotPasswordMutation,
		getVariables: () => getValues(),
		validate: () => isValid,
		onSuccess: async (res) => {
			// Dev-only: jump straight to reset with token
			if (res?.token) {
				router.replace(`/password/reset?token=${encodeURIComponent(res.token)}`);
			} else {
				// Fallback: a dev page that explains what's happening
				router.replace('/password/reset?dev=1');
			}
		},
		onError: (err) => {
			const message =
				err instanceof Error && err.message
					? err.message
					: 'Could not process password reset request.';
			toast.showToast({ message, variant: 'error' });
		},
		skipDefaultToast: true,
	});

	return (
		<>
			<div className='flex flex-col items-center gap-4'>
				<h1 className='h1'>Forgot password?</h1>
				<p className='body2'>Enter your account email to continue.</p>
			</div>
			<Form {...form}>
				<form
					onSubmit={handleSubmit}
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
							disabled={!isValid || loading}
							loading={loading}
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
