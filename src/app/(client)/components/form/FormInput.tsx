'use client';

import { ComponentPropsWithoutRef, useState } from 'react';

import { Control, FieldValues, Path } from 'react-hook-form';

import { EyeIcon, EyeOffIcon } from 'lucide-react';

import { FormControl, FormField, FormItem, FormLabel, FormMessage, Input } from '@shadcn-ui';

import { Button } from '@components';

import { cn } from '@lib/utils';

/** Forwardable subset of shadcn `<Input>` props; excludes RHF-controlled and wrapper-owned keys. */
type InputRestProps = Omit<
	ComponentPropsWithoutRef<typeof Input>,
	'name' | 'value' | 'onChange' | 'onBlur' | 'ref' | 'type' | 'className' | 'placeholder' | 'id'
>;

interface FormInputProps<T extends FieldValues> extends InputRestProps {
	control?: Control<T>;
	name: Path<T>;
	label?: string;
	type?: string;
	placeholder?: string;
	className?: string;
}

export default function FormInput<T extends FieldValues>({
	control,
	name,
	label,
	type = 'text',
	placeholder,
	className,
	...props
}: FormInputProps<T>) {
	const isPassword = type === 'password';
	const [showPassword, setShowPassword] = useState(false);

	const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem>
					{label && <FormLabel>{label}</FormLabel>}
					<FormControl>
						<div className='relative'>
							<Input
								{...props}
								type={inputType}
								placeholder={placeholder}
								className={cn(isPassword && 'pr-12', className)}
								{...field}
							/>
							{isPassword && (
								<Button
									variant='ghost'
									size='icon'
									type='button'
									onClick={togglePasswordVisibility}
									aria-label={showPassword ? 'Hide password' : 'Show password'}
									className='absolute top-1/2 right-2 h-7 w-7 -translate-y-1/2'
									iconOnly
								>
									{showPassword ? <EyeOffIcon /> : <EyeIcon />}
								</Button>
							)}
						</div>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
