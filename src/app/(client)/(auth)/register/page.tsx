'use client';

import React from 'react';

import { toast } from 'react-hot-toast';

import { useRouter } from 'next/navigation';

import { Form } from '@shadcn-ui';

import { useLoginMutation, useRegisterMutation } from '@hooks/data';
import { useFormWithSchema } from '@hooks/forms';

import { Button, FormInput } from '@components';

import { handleFormError } from '@lib/utils';
import { RegisterSchema, registerDefaults } from '@lib/validation';

export default function RegisterPage() {
	const router = useRouter();
	const registerMutation = useRegisterMutation();
	const loginMutation = useLoginMutation();

	// Initialize form with schema and defaults
	const form = useFormWithSchema(RegisterSchema, registerDefaults);

	const onSubmit = form.handleSubmit(async (data) => {
		try {
			// Register the user
			const response = await registerMutation.mutateAsync(data);
			const message = response?.message ?? 'Account created. Redirecting to your dashboard…';

			// Auto-login after successful registration
			try {
				await loginMutation.mutateAsync({ email: data.email, password: data.password });
				toast.success(message);
				router.replace('/dashboard');
			} catch (loginErr) {
				// Registration succeeded but auto-login failed
				const loginMessage =
					loginErr instanceof Error
						? loginErr.message
						: "Account created, but we couldn't sign you in automatically. Please log in.";
				toast.error(loginMessage);

				// Fallback: redirect to login page
				router.replace('/login?reason=autoLoginFailed');
			}
		} catch (err) {
			handleFormError(err, {
				setError: form.setError,
				errorMessage: 'Unable to create account!',
			});
		}
	});

	return (
		<>
			<div className='flex flex-col items-center gap-4'>
				<h1 className='h1'>Create an account</h1>
				<p className='body2'>Enter your credentials below to create your account.</p>
			</div>
			<Form {...form}>
				<form
					onSubmit={onSubmit}
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
					<div>
						<Button
							type='submit'
							fullWidth
							disabled={!form.formState.isValid}
							loading={registerMutation.isPending || loginMutation.isPending}
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
