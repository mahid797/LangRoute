'use client';

import { useEffect, useMemo, useState } from 'react';

import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle } from 'lucide-react';
import sanitizeHtml from 'sanitize-html';
import { codeToHtml } from 'shiki';
import { toast } from 'sonner';

import { AiProviderInterface } from '@/app/(server)/services/aiProvider/service';
import { curlCommand, nodeCommand, pythonCommand } from '@/lib/utils/onboardingUtils';
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

/* eslint-disable react-hooks/exhaustive-deps */

/**
 *
 * @param setIsOpen Function to set the onboarding modal open state
 * @param setStep Function to set the current step of the onboarding process
 * @returns First step of the onboarding process where user sets up their LangRoute environment (AI provider and API key for the provider)
 */
const OnboardingStep1 = ({
	setIsOpen,
	setStep,
	form,
}: {
	setIsOpen: (isOpen: boolean) => void;
	setStep: (step: number) => void;
	form: ReturnType<typeof useForm<CreateAiKeyData>>;
}) => {
	const [providers, setProviders] = useState<AiProviderInterface[]>([]);
	// const form = useForm<CreateAiKeyData>({
	// 	resolver: zodResolver(CreateAiKeySchema),
	// 	defaultValues: {
	// 		provider: providers[0]?.code as CreateAiKeyData['provider'],
	// 		apiKey: 'sk-1234abcd',
	// 		aiKey: '',
	// 	},
	// });
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
			setIsFormLoading(false);
			setStep(1);
		} else {
			const errorData = await res.json();
			toast.error('Failed to create AI key. Please try again.', {
				description: errorData.error.message,
			});
			setIsFormLoading(false);
		}
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
	provider,
	apiKey,
}: {
	setIsOpen: (isOpen: boolean) => void;
	setStep: (step: number) => void;
	provider: string;
	apiKey: string;
}) => {
	const [activeTab, setActiveTab] = useState<'curl' | 'python' | 'node'>('node');
	const [code, setCode] = useState<string>('');
	const [isLoading, setIsLoading] = useState(false);

	const codes = useMemo(
		() => ({
			node: {
				code: nodeCommand(apiKey, provider),
				lang: 'javascript',
			},
			curl: { code: curlCommand(apiKey, provider), lang: 'bash' },
			python: { code: pythonCommand(apiKey, provider), lang: 'python' },
		}),
		[apiKey, provider],
	);

	const codeToHtmlSanitized = async () => {
		const html = await codeToHtml(codes[activeTab].code, {
			lang: codes[activeTab].lang,
			theme: 'dark-plus',
		});
		return sanitizeHtml(html, {
			allowedTags: sanitizeHtml.defaults.allowedTags.concat(['span']),
			allowedAttributes: {
				...sanitizeHtml.defaults.allowedAttributes,
				span: ['className', 'style'],
				code: ['className', 'style'],
				pre: ['className', 'style'],
			},
		});
	};

	useEffect(() => {
		codeToHtmlSanitized().then(setCode);
	}, [activeTab, code]);

	const handleContinue = async () => {
		setIsLoading(true);
		const res = await fetch('/api/settings/environment/');
		const data = await res.json();
		if (!data?.validated) {
			toast.error('Please run the test successfully before continuing.');
			setIsLoading(false);
			return;
		}
		setIsLoading(false);
		setStep(2);
	};

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
						onClick={() => setActiveTab('node')}
						isActive={activeTab === 'node'}
					>
						Node.js
					</Button>
					<Button
						size='sm'
						variant='outline'
						onClick={() => setActiveTab('curl')}
						isActive={activeTab === 'curl'}
					>
						Curl
					</Button>
					<Button
						size='sm'
						variant='outline'
						onClick={() => setActiveTab('python')}
						isActive={activeTab === 'python'}
					>
						Python
					</Button>
				</div>
				<small>Waiting for test results...</small>
			</div>
			<div
				className='border-border mb-6 overflow-x-auto rounded-md border break-all [&_code]:!p-0 [&_pre]:p-4 [&_pre]:text-xs'
				dangerouslySetInnerHTML={{ __html: code }}
			/>
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
					<Button onClick={handleContinue}>
						{isLoading ? (
							<LoaderCircle
								className='text-accent animate-spin'
								size={40}
							/>
						) : (
							'Continue'
						)}
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
	const form = useForm<CreateAiKeyData>({
		resolver: zodResolver(CreateAiKeySchema),
		defaultValues: {
			provider: '' as CreateAiKeyData['provider'],
			apiKey: 'sk-1234abcd',
			aiKey: '',
		},
	});

	const steps = [
		<OnboardingStep1
			key={0}
			setStep={setScreen}
			setIsOpen={setIsOpen}
			form={form}
		/>,
		<OnboardingStep2
			key={1}
			setStep={setScreen}
			setIsOpen={setIsOpen}
			provider={form.getValues('provider')}
			apiKey={form.getValues('apiKey')}
		/>,
		<OnboardingStep3
			key={2}
			setIsOpen={setIsOpen}
		/>,
	];

	return steps[screen];
};

export default Onboarding;
