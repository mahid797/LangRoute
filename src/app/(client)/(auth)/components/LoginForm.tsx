'use client';

import React from 'react';

import NextLink from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button, FormInput } from '@components';

import { useLoginMutation } from '@/app/(client)/hooks/data';
import { useFormSubmission, useLoginForm } from '@/app/(client)/hooks/forms';
import { isSafeRelativePath } from '@/lib/utils';
import { Form } from '@/shadcn-ui';

export default function LoginForm() {
	const router = useRouter();
	const loginMutation = useLoginMutation();
	const form = useLoginForm();

	// Determine safe redirect target from ?callbackUrl (same-origin only)
	const params = useSearchParams();
	const callbackUrlParam = params.get('callbackUrl');
	const nextUrl = isSafeRelativePath(callbackUrlParam) ? callbackUrlParam! : '/dashboard';

	const {
		getValues,
		formState: { isValid },
	} = form;

	const { loading, handleSubmit, toast } = useFormSubmission({
		mutation: loginMutation,
		getVariables: () => getValues(),
		validate: () => isValid,
		onSuccess: async () => {
			const message = loginMutation.data?.message ?? 'Logged in successfully. Redirecting…';
			toast.showToast({ message, variant: 'success' });

			router.replace(nextUrl);
		},
		onError: (err) => {
			const message = err.message ?? 'Unable to log in!';
			toast.showToast({ message, variant: 'error' });
		},
		skipDefaultToast: true,
	});

	return (
		<>
			<h1 className='h1'>Login to your account</h1>
			<Form {...form}>
				<form
					onSubmit={handleSubmit}
					className='min-w-[25em]'
				>
					<div className='flex flex-col gap-5'>
						<FormInput
							control={form.control}
							name='email'
							label='Email'
							type='email'
							placeholder='m@example.com'
						/>
						<FormInput
							control={form.control}
							name='password'
							label='Password'
							type='password'
							placeholder='********'
						/>
					</div>
					<div className='mt-3 mb-11'>
						<NextLink href='/password/forgot'>Forgot password?</NextLink>
					</div>
					<div>
						<Button
							type='submit'
							fullWidth
							disabled={!isValid}
							loading={loading}
							loadingText='Logging in...'
						>
							Log in
						</Button>
					</div>
				</form>
			</Form>
			<div>
				<span className='body2'>New to LangRoute? </span>
				<NextLink href='/register'>Create an account</NextLink>
			</div>
		</>
	);
}
