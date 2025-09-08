'use client';

import React from 'react';

import { useRouter } from 'next/navigation';

import { useQueryClient } from '@tanstack/react-query';

import { Button, FormInput } from '@components';

import { useLoginMutation, useRegisterMutation } from '@/app/(client)/hooks/data';
import { useFormSubmission, useRegisterForm } from '@/app/(client)/hooks/forms';
import { queryKeys } from '@/lib/queryKeys';
import { Form } from '@/shadcn-ui';

export default function RegisterForm() {
	const router = useRouter();
	const registerMutation = useRegisterMutation();
	const loginMutation = useLoginMutation();
	const queryClient = useQueryClient();
	const form = useRegisterForm();

	const {
		register,
		getValues,
		formState: { errors, isValid },
	} = form;

	const { loading, handleSubmit, toast } = useFormSubmission({
		mutation: registerMutation,
		getVariables: () => getValues(),
		validate: () => isValid,
		onSuccess: async () => {
			const { email, password } = getValues();

			// Auto login after successful registration
			try {
				await loginMutation.mutateAsync({ email, password });

				// Invalidate auth cache so useSessionUser refetches immediately.
				await queryClient.invalidateQueries({ queryKey: queryKeys.auth.session });

				const message =
					registerMutation.data?.message ?? 'Account created. Redirecting to your dashboard…';
				toast.showToast({ message, variant: 'success' });

				router.replace('/dashboard');
			} catch (err) {
				const message =
					err instanceof Error
						? err.message
						: 'Account created, but we couldn’t sign you in automatically. Please log in.';
				toast.showToast({ message, variant: 'error' });

				// Reasonable fallback: send them to the login page with email prefilled
				router.replace(`/login?email=${encodeURIComponent(email)}`);
			}
		},
		onError: (err) => {
			const message = err.message ?? 'Unable to create account!';
			toast.showToast({ message, variant: 'error' });
		},
		skipDefaultToast: true,
	});

	return (
		<>
			<div className='flex flex-col items-center gap-4'>
				<h1 className='h1'>Create an account</h1>
				<p className='body2'>Enter your credentials below to create your account.</p>
			</div>
			<Form {...form}>
				<form
					onSubmit={handleSubmit}
					className='min-w-[25em]'
				>
					<div className='mb-10 flex flex-col gap-5'>
						<FormInput
							label='Full name'
							placeHolder='Enter your full name'
							{...register('name')}
							errorMessage={errors.name?.message}
						/>
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
							placeHolder='Create a password'
							{...register('password')}
							errorMessage={errors.password?.message}
						/>
						<FormInput
							label='Confirm password'
							type='password'
							placeHolder='Confirm your password'
							{...register('confirmPassword')}
							errorMessage={errors.confirmPassword?.message}
						/>
					</div>
					<div>
						<Button
							type='submit'
							fullWidth
							disabled={!isValid}
							loading={loading}
							loadingText='Creating account...'
						>
							Create your account
						</Button>
					</div>
				</form>
			</Form>
		</>
	);
}
