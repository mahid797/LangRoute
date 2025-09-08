'use client';

import React from 'react';

import NextLink from 'next/link';
import { useRouter } from 'next/navigation';

import { useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { Button, FormInput } from '@components';

import { useLoginMutation } from '@/app/(client)/hooks/data';
import { useFormSubmission, useLoginForm } from '@/app/(client)/hooks/forms';
import { queryKeys } from '@/lib/queryKeys';
import { Form } from '@/shadcn-ui';

type ApiError = {
	message?: string;
	fieldErrors?: Partial<Record<'email' | 'password' | '_form', string>>;
};

export default function LoginForm() {
	const router = useRouter();
	const loginMutation = useLoginMutation();
	const queryClient = useQueryClient();
	const form = useLoginForm();

	const {
		register,
		getValues,
		formState: { errors, isValid },
	} = form;

	const { loading, handleSubmit, toast } = useFormSubmission({
		mutation: loginMutation,
		getVariables: () => getValues(),
		validate: () => isValid,
		onSuccess: async () => {
			// Invalidate auth cache so useCurrentUserQuery refetches immediately.
			await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });

			const message = loginMutation.data?.message ?? 'Logged in successfully. Redirecting…';
			toast.showToast({ message, variant: 'success' });
			router.replace('/dashboard');
		},
		onError: (err: unknown) => {
			const ax = err as AxiosError<ApiError> | undefined;
			const message = ax?.response?.data?.message ?? 'Unable to log in!';
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
					<div className='mb-10 flex flex-col gap-5'>
						<FormInput
							label='Email'
							type='email'
							placeHolder='m@example.com'
							{...register('email')}
							errorMessage={errors.email?.message}
						/>
						<FormInput
							label='Password'
							type='password'
							placeHolder='********'
							{...register('password')}
							errorMessage={errors.password?.message}
						/>
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
			<NextLink href='/password/forgot'>Forgot your password?</NextLink>
		</>
	);
}
