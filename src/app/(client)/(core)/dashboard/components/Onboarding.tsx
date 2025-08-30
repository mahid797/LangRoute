'use client';

import { useState } from 'react';

import { Button, DialogDescription, DialogHeader, DialogTitle, Input, Select } from '@/shadcn-ui';

const OnboardingStep1 = ({
	setIsOpen,
	setStep,
}: {
	setIsOpen: (isOpen: boolean) => void;
	setStep: (step: number) => void;
}) => {
	return (
		<div>
			<DialogHeader>
				<DialogTitle>First, setup your LangRoute environment</DialogTitle>
			</DialogHeader>
			<div>
				<label>
					We created a LangRoute API key for your API calls:
					<Input
						value='sk-1234abcd'
						readOnly
					/>
				</label>
				<small>This is used to authenticate against LangRoute when you make an API call.</small>
			</div>

			<label>
				Create a provider/model to connect to
				<Select />
			</label>

			<label>
				Enter your LLM model API key
				<Input placeholder='Your provider/model API key' />
			</label>

			<div>
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
			<DialogHeader>
				<DialogTitle>Let’s run a test now</DialogTitle>
				<DialogDescription>
					Run the following code and send us a request. Do not forget to change your server’s IP
					address or it won’t reach us.
				</DialogDescription>
			</DialogHeader>
			<div>
				<div>
					<Button>Curl</Button>
					<Button>Python</Button>
					<Button>Node.js</Button>
				</div>
				<small>Waiting for test results...</small>
			</div>
			<div>
				<code>{`// npm install --save langroute
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
					onClick={() => setStep(2)}
				>
					Skip this test
				</Button>
				<div>
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
			<DialogTitle>That was it!</DialogTitle>
			<DialogDescription>
				You can now use the LangRoute API key created for you, and start sending API calls to
				LangRoute. All your requests will be logged and forwarded to one of the LLMs. You can also
				view logs and other information from this page. In case you forgot to get a copy of your
				LangRoute API key, here it is:
			</DialogDescription>
			<Input
				value='sk-1234abcd'
				readOnly
			/>
			<div>
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
