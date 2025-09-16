'use client';

import { useEffect, useState } from 'react';

import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';

import { AiProviderInterface } from '@/app/(server)/services/aiProvider/service';
import { CreateAiKeyData, CreateAiKeySchema } from '@/lib/validation/aiKeys.schemas';
import {
	Button,
	Form,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	Input,
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shadcn-ui';

/**
 *
 * @param setIsOpen Function to set the onboarding modal open state
 * @param setStep Function to set the current step of the onboarding process
 * @returns First step of the onboarding process where user sets up their LangRoute environment (AI provider and API key for the provider)
 */
const OnboardingStep1 = ({
	setIsOpen,
	setStep,
}: {
	setIsOpen: (isOpen: boolean) => void;
	setStep: (step: number) => void;
}) => {
	const [providers, setProviders] = useState<AiProviderInterface[]>([]);
	const form = useForm<CreateAiKeyData>({
		resolver: zodResolver(CreateAiKeySchema),
		defaultValues: {
			provider: providers[0]?.code as CreateAiKeyData['provider'],
			apiKey: 'sk-1234abcd',
			aiKey: '',
		},
	});
	const {
		handleSubmit,
		formState: { errors },
	} = form;
	const [isLoading, setIsLoading] = useState(true);
	const [isFormLoading, setIsFormLoading] = useState(false);

	const getProviders = async () => {
		const res = await fetch('/api/settings/aiProviders');
		const data = await res.json();
		setProviders(data);
		setIsLoading(false);
	};

	useEffect(() => {
		getProviders();
	}, []);

	const onSubmit = async (data: CreateAiKeyData) => {
		setIsFormLoading(true);
		if (Object.keys(errors).length !== 0) {
			return;
		}
		const res = await fetch('/api/settings/environment', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});
		if (res.ok) {
			setStep(1);
		} else {
			const errorData = await res.json();
			toast.error('Failed to create AI key. Please try again.', {
				description: errorData.error.message,
			});
		}
		setIsFormLoading(false);
	};

	if (isLoading) {
		return (
			<div className='flex h-full w-full items-center justify-center'>
				<LoaderCircle
					className='text-foreground animate-spin'
					size={40}
				/>
			</div>
		);
	}

	return (
		<Form {...form}>
			<form
				className='flex flex-col gap-5'
				onSubmit={handleSubmit(onSubmit)}
			>
				<h2 className='font-semibold'>First, setup your LangRoute environment</h2>
				<FormField
					control={form.control}
					name='apiKey'
					render={({ field }) => (
						<FormItem>
							<FormLabel>We created a LangRoute API key for your API calls:</FormLabel>
							<Input
								{...field}
								readOnly
							/>
							<FormDescription>
								This is used to authenticate against LangRoute when you make an API call.
							</FormDescription>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='provider'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Create a provider/model to connect to</FormLabel>
							<Select
								onValueChange={field.onChange}
								defaultValue={field.value}
							>
								<SelectTrigger className='w-full'>
									<SelectValue placeholder='Select an AI Provider' />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										{providers.map((provider) => (
											<SelectItem
												key={provider.id}
												value={provider.code}
											>
												{provider.name}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
							{errors.provider && <p className='text-sm text-red-600'>{errors.provider.message}</p>}
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='aiKey'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Enter your LLM model API key</FormLabel>
							<Input
								placeholder='Your provider/model API key'
								{...field}
							/>
							{errors.aiKey && <p className='text-sm text-red-600'>{errors.aiKey.message}</p>}
						</FormItem>
					)}
				/>

				<div className='mt-6 flex items-center justify-between gap-2'>
					<Button
						variant='outline'
						type='button'
						onClick={() => setIsOpen(false)}
					>
						Skip onboarding
					</Button>
					<Button type='submit'>
						{isFormLoading ? (
							<LoaderCircle
								className='text-accent animate-spin'
								size={40}
							/>
						) : (
							'Apply and go to next step'
						)}
					</Button>
				</div>
			</form>
		</Form>
	);
};

const OnboardingStep2 = ({
	setStep,
	setIsOpen,
}: {
	setIsOpen: (isOpen: boolean) => void;
	setStep: (step: number) => void;
}) => {
	return (
		<div>
			<h2 className='mb-2 font-semibold'>Let’s run a test now</h2>
			<p className='text-muted-foreground mb-4 text-sm'>
				Run the following code and send us a request. Do not forget to change your server’s IP
				address or it won’t reach us.
			</p>
			<div className='mb-4 flex items-center justify-between gap-2'>
				<div className='grid grid-cols-3 gap-2'>
					<Button
						size='sm'
						variant='outline'
					>
						Curl
					</Button>
					<Button
						size='sm'
						variant='outline'
						isActive
					>
						Python
					</Button>
					<Button
						size='sm'
						variant='outline'
					>
						Node.js
					</Button>
				</div>
				<small>Waiting for test results...</small>
			</div>
			<div className='bg-muted border-border mb-6 overflow-x-auto rounded-md border p-4'>
				<code className='font-mono text-sm'>{`// npm install --save langroute
import {LangRoute} from 'langroute';

// Create an LLM using a virtual key
const langroute = new LangRoute({
    apiKey: "GuzafnEa55uwdBaF88aBuV0Q2Z",
    virtualKey: "virtual-key-12abdf"
});

const chatCompletion = await langroute.chat.completions.create({
    messages: [{ role: 'user', content: 'What is an LLM proxy?' }],
    model: "gpt-4o",
    maxTokens: 64
});

console.log(chatCompletion.choices);

`}</code>
			</div>
			<div className='flex items-center justify-between'>
				<Button
					variant='link'
					className='!px-0'
					onClick={() => setStep(2)}
				>
					Skip this test
				</Button>
				<div className='flex gap-3'>
					<Button
						variant='outline'
						onClick={() => setIsOpen(false)}
					>
						Cancel
					</Button>
					<Button
						onClick={() => {
							// TODO: verify if the test request was successful
							setStep(2);
						}}
					>
						Continue
					</Button>
				</div>
			</div>
		</div>
	);
};

const OnboardingStep3 = ({ setIsOpen }: { setIsOpen: (isOpen: boolean) => void }) => {
	return (
		<div>
			<h2 className='mb-2 font-semibold'>That was it!</h2>
			<p className='text-muted-foreground mb-4 text-sm'>
				You can now use the LangRoute API key created for you, and start sending API calls to
				LangRoute. All your requests will be logged and forwarded to one of the LLMs. You can also
				view logs and other information from this page. In case you forgot to get a copy of your
				LangRoute API key, here it is:
			</p>
			<Input
				value='sk-1234abcd'
				readOnly
			/>
			<div className='mt-6 flex items-center justify-end gap-2'>
				<Button onClick={() => setIsOpen(false)}>Continue</Button>
			</div>
		</div>
	);
};

const Onboarding = ({ setIsOpen }: { setIsOpen: (isOpen: boolean) => void }) => {
	const [screen, setScreen] = useState(0);
	const steps = [
		<OnboardingStep1
			key={0}
			setStep={setScreen}
			setIsOpen={setIsOpen}
		/>,
		<OnboardingStep2
			key={1}
			setStep={setScreen}
			setIsOpen={setIsOpen}
		/>,
		<OnboardingStep3
			key={2}
			setIsOpen={setIsOpen}
		/>,
	];

	return steps[screen];
};

export default Onboarding;
