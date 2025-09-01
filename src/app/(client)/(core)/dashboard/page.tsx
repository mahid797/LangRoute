'use client';

import { useEffect, useState } from 'react';

import { LoaderCircle } from 'lucide-react';

import DashboardContent from './components/DashboardContent';
import Onboarding from './components/Onboarding';

export default function DashboardPage() {
	const [openOnboarding, setOpenOnboarding] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchApiKeys = async () => {
			const res = await fetch('/api/apikeys');
			const data = await res.json();
			if (data.apiKeys.length === 0) {
				setOpenOnboarding(true);
			}
			setIsLoading(false);
		};
		fetchApiKeys();
	}, []);

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
		<>
			<div className='px-6 py-10 sm:px-20'>
				{openOnboarding ? (
					<div className='border-border bg-popover mx-auto max-w-[640px] rounded-md border px-6 py-4 shadow-md'>
						<Onboarding setIsOpen={setOpenOnboarding} />
					</div>
				) : (
					<DashboardContent />
				)}
			</div>
		</>
	);
}
// export const metadata = {
// 	title: 'Dashboard',
// 	description: 'Your dashboard overview',
// };
