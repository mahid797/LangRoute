'use client';

/**
 * ============================================================================
 * TEMPORARY COMPATIBILITY SHIM - DO NOT USE IN PRODUCTION - GC 2025-10-14
 * ============================================================================
 *
 * CONTEXT:
 * The backend removed `CreateVirtualKeySchema` from validation because we now
 * use a unified `CreateAccessKeySchema` for all access key operations. The
 * real schema only accepts: { name?, description? }.
 *
 * PROBLEM:
 * This FE component still renders fields (alias, provider, apiKey) that don't
 * exist in the real backend schema, causing TypeScript errors.
 *
 * TEMPORARY SOLUTION:
 * We define a LOCAL schema that accepts the old fields purely for FE type safety.
 * This allows the component to compile but DOES NOT submit to the backend yet.
 *
 * TODO (GC 2025-10-14): Remove this entire shim when implementing proper FE refactor:
 * 1. Remove this local CreateVirtualKeySchema definition
 * 2. Import and use CreateAccessKeySchema directly from @lib/validation
 * 3. Update form fields to match backend: name (not alias), description, allowedModels
 * 4. Remove provider/apiKey fields (not part of access key model)
 * 5. Implement real submit flow to POST /api/access-keys with proper data shape
 * 6. Update component copy/UX to reflect "Access Key" (not "Virtual Key")
 * ============================================================================
 */
import { z } from 'zod';

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
	Separator,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from '@shadcn-ui';

import { useFormWithSchema } from '@hooks/forms';

import { Button, FormInput } from '@components';

// TEMPORARY: Local schema for build compatibility only - GC 2025-10-14
const CreateVirtualKeySchema = z.object({
	alias: z.string().trim().min(1).max(100).optional(),
	description: z.string().trim().max(500).optional(),
	provider: z.string().trim().min(1).optional(),
	apiKey: z.string().trim().min(1).optional(),
});

export default function KeyCreateModal() {
	// TEMPORARY: Local defaults for build compatibility only - GC 2025-10-14
	const createVirtualKeyDefaults = {
		alias: '',
		description: '',
		provider: '',
		apiKey: '',
	};

	// Initialize form with schema and defaults
	const form = useFormWithSchema(CreateVirtualKeySchema, createVirtualKeyDefaults);

	// Handle form submission
	const onSubmit = form.handleSubmit(async (data) => {
		try {
			console.log('Virtual key data:', data);
			// TODO: Implement API call to create virtual key
			// await createVirtualKeyMutation.mutateAsync(data);
		} catch (err) {
			console.error('Failed to create virtual key:', err);
			// TODO: Add error handling
		}
	});

	return (
		<>
			<SheetHeader className='pb-0'>
				<SheetTitle>Create Access Key</SheetTitle>
			</SheetHeader>

			<Separator />

			<Form {...form}>
				<form
					onSubmit={onSubmit}
					className='flex h-full flex-col'
				>
					<div className='grid flex-1 auto-rows-min gap-10 px-4'>
						{/* Key Info */}
						<div className='grid gap-5'>
							<div>
								<h3 className='h3'>Key details</h3>
								<p className='body2'>
									Assign an alias and description to help organise keys across projects and
									environments.
								</p>
							</div>
							<FormInput
								control={form.control}
								label='Name of the key'
								name='alias'
								placeholder='Alias'
							/>
							<FormInput
								control={form.control}
								label='Description'
								name='description'
								placeholder='A short description of the virtual key'
							/>
						</div>

						{/* AI Provider Info */}
						<div className='grid gap-5'>
							<div>
								<h3 className='h3'>Provider Configuration</h3>
								<p className='body2'>Add the credentials for your preferred AI provider.</p>
							</div>
							<FormField
								control={form.control}
								name='provider'
								render={({ field }) => (
									<FormItem>
										<FormLabel>AI provider</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger className='w-full'>
													<SelectValue placeholder='Select an AI provider' />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectGroup>
													<SelectLabel>AI providers</SelectLabel>
													<SelectItem value='openai'>OpenAI</SelectItem>
													<SelectItem value='anthropic'>Anthropic</SelectItem>
													<SelectItem value='google'>Google</SelectItem>
													{/* Add more providers as needed */}
												</SelectGroup>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='apiKey'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Provider API Key</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger className='w-full'>
													<SelectValue placeholder='Select a Provider API Key' />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectGroup>
													<SelectLabel>Provider API Keys</SelectLabel>
													<SelectItem value='key1'>Key 1</SelectItem>
													<SelectItem value='key2'>Key 2</SelectItem>
													{/* TODO: Load actual Provider API Keys from backend */}
												</SelectGroup>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>

					<SheetFooter>
						<Button
							type='submit'
							variant='default'
							loading={form.formState.isSubmitting}
							disabled={form.formState.isSubmitting}
						>
							Generate
						</Button>
					</SheetFooter>
				</form>
			</Form>
		</>
	);
}
