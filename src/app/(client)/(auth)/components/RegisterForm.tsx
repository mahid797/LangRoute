'use client';

import React from 'react';

import { useRouter } from 'next/navigation';

import { Button, FormInput, PasswordValidation } from '@components';

import { useLoginMutation, useRegisterMutation } from '@/app/(client)/hooks/data';
import { useFormSubmission, useRegisterForm } from '@/app/(client)/hooks/forms';
import { Form } from '@/shadcn-ui';

export default function RegisterForm() {
	const router = useRouter();
	const registerMutation = useRegisterMutation();
	const loginMutation = useLoginMutation();
	const form = useRegisterForm();

	const {
		getValues,
		formState: { isValid },
		watchPassword,
		isPasswordTouched,
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
							control={form.control}
							name='name'
							label='Full name'
							placeholder='Enter your full name'
						/>
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
