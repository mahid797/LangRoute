'use client';

import { useState } from 'react';

import {
	Button,
	Input,
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shadcn-ui';

const AIProviders = [
	{
		name: 'GPT3.5',
		value: 'gpt3.5-turbo',
	},
	{
		name: 'GPT4',
		value: 'gpt4',
	},
	{
		name: 'GPT4o',
		value: 'gpt4o',
	},
	{
		name: 'GPT4o-mini',
		value: 'gpt4o-mini',
	},
	{
		name: 'Claude',
		value: 'claude-2',
	},
	{
		name: 'Claude-instant',
		value: 'claude-instant-100k',
	},
	{
		name: 'Llama2',
		value: 'llama2-70b-chat',
	},
	{
		name: 'Llama3',
		value: 'llama3-70b-chat',
	},
];

const OnboardingStep1 = ({
	setIsOpen,
	setStep,
}: {
	setIsOpen: (isOpen: boolean) => void;
	setStep: (step: number) => void;
}) => {
	return (
		<div className='flex flex-col gap-5'>
			<h2 className='font-semibold'>First, setup your LangRoute environment</h2>

			<div>
				<label className='text-foreground text-sm'>
					We created a LangRoute API key for your API calls:
					<Input
						value='sk-1234abcd'
						readOnly
					/>
				</label>
				<small className='text-muted-foreground text-xs'>
					This is used to authenticate against LangRoute when you make an API call.
				</small>
			</div>

			<label className='text-secondary-foreground text-sm'>
				Create a provider/model to connect to
				<Select>
					<SelectTrigger className='w-full'>
						<SelectValue placeholder='Select an AI Provider' />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							{AIProviders.map((provider) => (
								<SelectItem
									key={provider.value}
									value={provider.value}
								>
									{provider.name}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			</label>

			<label className='text-secondary-foreground text-sm'>
				Enter your LLM model API key
				<Input placeholder='Your provider/model API key' />
			</label>

			<div className='mt-6 flex items-center justify-between gap-2'>
				<Button
					variant='outline'
					onClick={() => setIsOpen(false)}
				>
					Skip onboarding
				</Button>
				<Button onClick={() => setStep(1)}>Apply and go to next step</Button>
			</div>
		</div>
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
