'use client';

import { useEffect, useState } from 'react';

import { Dialog, DialogContent } from '@/shadcn-ui';

import DashboardContent from './components/DashboardContent';
import Onboarding from './components/Onboarding';

export default function DashboardPage() {
	const [openOnboarding, setOpenOnboarding] = useState(false);

	useEffect(() => {
		const apiKeys = [];
		if (apiKeys.length === 0) {
			setOpenOnboarding(true);
		}
	}, []);

	return (
		<>
			<div className='px-6 py-10 sm:px-20'>
				{openOnboarding ? null : <DashboardContent />}
				<Dialog
					open={openOnboarding}
					onOpenChange={setOpenOnboarding}
				>
					<DialogContent>
						<Onboarding setIsOpen={setOpenOnboarding} />
					</DialogContent>
				</Dialog>
			</div>
		</>
	);
}
// export const metadata = {
// 	title: 'Dashboard',
// 	description: 'Your dashboard overview',
// };
