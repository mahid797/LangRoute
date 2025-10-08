'use client';

import React from 'react';

import { toast } from 'react-hot-toast';

import NextLink from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { Form } from '@shadcn-ui';

import { useLoginMutation } from '@hooks/data';
import { useFormWithSchema } from '@hooks/forms';

import { Button, FormInput } from '@components';

import { handleFormError, isSafeRelativePath } from '@lib/utils';
import { LoginSchema, loginDefaults } from '@lib/validation';

export default function LoginPage() {
	const router = useRouter();
	const params = useSearchParams();
	const loginMutation = useLoginMutation();

	// Initialize form with schema and defaults
	const form = useFormWithSchema(LoginSchema, loginDefaults);

	// Determine safe redirect target from ?callbackUrl (same-origin only)
	const callbackUrlParam = params.get('callbackUrl');
	const nextUrl = isSafeRelativePath(callbackUrlParam) ? callbackUrlParam : '/dashboard';

	const onSubmit = form.handleSubmit(async (data) => {
		try {
			const response = await loginMutation.mutateAsync(data);
			const message = response?.message ?? 'Logged in successfully. Redirecting…';
			toast.success(message);
			router.replace(nextUrl);
		} catch (err) {
			handleFormError(err, {
				setError: form.setError,
				errorMessage: 'Unable to log in!',
			});
		}
	});

	return (
		<>
			<h1 className='h1'>Login to your account</h1>
			<Form {...form}>
				<form
					onSubmit={onSubmit}
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
							disabled={!form.formState.isValid}
							loading={loginMutation.isPending}
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
